import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { VPAID } from 'Views/VPAID';
import { FinishState } from 'Constants/FinishState';
import { Platform } from 'Constants/Platform';
import { Url } from 'Utilities/Url';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Timer } from 'Utilities/Timer';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { FocusManager } from 'Managers/FocusManager';
import { VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { AbstractOverlay } from 'Views/AbstractOverlay';
import { Closer } from 'Views/Closer';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Placement } from 'Models/Placement';

export interface IVPAIDAdUnitParameters extends IAdUnitParameters<VPAIDCampaign> {
    vpaid: VPAID;
    closer: Closer;
    endScreen?: VPAIDEndScreen;
}

export class VPAIDAdUnit extends AbstractAdUnit {

    public static setAdLoadTimeout(timeout: number) {
        VPAIDAdUnit._adLoadTimeout = timeout;
    }

    private static _adLoadTimeout: number = 10 * 1000;
    private _closer: Closer;
    private _placement: Placement;
    private _focusManager: FocusManager;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: VPAID;
    private _vpaidCampaign: VPAIDCampaign;
    private _timer: Timer;
    private _options: any;
    private _deviceInfo: DeviceInfo;

    private _onAppForegroundHandler: any;
    private _onAppBackgroundHandler: any;

    constructor(nativeBridge: NativeBridge, parameters: IVPAIDAdUnitParameters) {
        super(nativeBridge, parameters);

        this._focusManager = parameters.focusManager;
        this._vpaidCampaign = parameters.campaign;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._options = parameters.options;
        this._view = parameters.vpaid;
        this._closer = parameters.closer;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._timer = new Timer(() => this.onAdUnitNotLoaded(), VPAIDAdUnit._adLoadTimeout);

        this._onAppBackgroundHandler = () => this.onAppBackground();
        this._onAppForegroundHandler = () => this.onAppForeground();

        this._closer.render();
    }

    public show(): Promise<void> {
        this.onShow();

        return this.setupWebPlayer().then(() => {
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, false, false, true, false, this._options).then(() => {
                return this.showCloser();
            });
        });
    }

    public hide(): Promise<void> {
        this.onHide();
        this.hideView();
        return this._container.close();
    }

    public description(): string {
        return 'vpaid';
    }

    public isCached(): boolean {
        return false;
    }

    public openUrl(url: string | null) {
        if (url && Url.isProtocolWhitelisted(url)) {
            if (this._nativeBridge.getPlatform() === Platform.IOS) {
                this._nativeBridge.UrlScheme.open(url);
            } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                this._nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': url
                });
            }
        }
    }

    public sendTrackingEvent(eventType: string) {
        const urls = this._vpaidCampaign.getTrackingEventUrls(eventType);

        for (const url of urls) {
            this.sendThirdPartyEvent(`vpaid ${eventType}`, url);
        }
    }

    public sendImpressionTracking() {
        const impressionUrls = this._vpaidCampaign.getImpressionUrls();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent('vpaid impression', impressionUrl);
            }
        }
    }

    public sendThirdPartyEvent(eventType: string, url: string) {
        const sessionId = this._vpaidCampaign.getSession().getId();
        const sdkVersion = this._operativeEventManager.getClientInfo().getSdkVersion();
        url = url.replace(/%ZONE%/, this._placement.getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._thirdPartyEventManager.sendEvent(eventType, sessionId, url, this._vpaidCampaign.getUseWebViewUserAgentForTracking());
    }

    public mute() {
        this._view.mute();
    }

    public unmute() {
        this._view.unmute();
    }

    public onAdLoaded() {
        this._timer.stop();
        this._view.showAd();
    }

    private setupWebPlayer(): Promise<{}> {
        const promises = [];
        promises.push(this._nativeBridge.WebPlayer.setSettings({
            setSupportMultipleWindows: [true],
            setMediaPlaybackRequiresUserGesture: [false]
        }, {}));
        promises.push(this._nativeBridge.WebPlayer.setEventSettings({
            onCreateWindow: {
                sendEvent: true
            }
        }));
        return Promise.all(promises);
    }

    private onAdUnitNotLoaded() {
        this.setFinishState(FinishState.ERROR);
        Diagnostics.trigger('vpaid_load_timeout', new DiagnosticError(new Error('VPAID failed to load within timeout'), {
            id: this._vpaidCampaign.getId()
        }), this._vpaidCampaign.getSession());
        this.hide();
    }

    private onShow() {
        this.setShowing(true);
        this.onStart.trigger();
        this._timer.start();

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._focusManager.onAppForeground.subscribe(this._onAppForegroundHandler);
            this._focusManager.onAppBackground.subscribe(this._onAppBackgroundHandler);
        } else {
            this._container.onShow.subscribe(this._onAppForegroundHandler);
            this._container.onAndroidPause.subscribe(this._onAppBackgroundHandler);
        }
    }

    private onHide() {
        this._closer.container().parentElement!.removeChild(this._closer.container());

        this._timer.stop();
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._focusManager.onAppForeground.unsubscribe(this._onAppForegroundHandler);
            this._focusManager.onAppBackground.unsubscribe(this._onAppBackgroundHandler);
        } else {
            this._container.onShow.unsubscribe(this._onAppForegroundHandler);
            this._container.onAndroidPause.unsubscribe(this._onAppBackgroundHandler);
        }
    }

    private showView() {
        this._view.show();
    }

    private hideView() {
        this._view.hide();
    }

    private onAppForeground() {
        if (this._view.isLoaded()) {
            this._view.resumeAd();
        } else {
            this._view.loadWebPlayer();
        }
    }

    private onAppBackground() {
        this._view.pauseAd();
    }

    private showCloser() {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
            const left = Math.floor(width * 0.90);
            const top = 0;
            const viewWidth = Math.floor(width * 0.10);
            const viewHeight = viewWidth;
            return this._container.setViewFrame('webview', left, top, viewWidth, viewHeight).then(() => {
                document.body.appendChild(this._closer.container());
            });
        });
    }
}
