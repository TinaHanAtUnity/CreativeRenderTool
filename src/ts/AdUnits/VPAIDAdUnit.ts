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
import { setTimeout } from 'timers';

export interface IVPAIDAdUnitParameters extends IAdUnitParameters<VPAIDCampaign> {
    vpaid: VPAID;
    endScreen?: VPAIDEndScreen;
    overlay: AbstractOverlay;
}

export class VPAIDAdUnit extends AbstractAdUnit<VPAIDCampaign> {

    public static setAdLoadTimeout(timeout: number) {
        VPAIDAdUnit._adLoadTimeout = timeout;
    }

    private static _adLoadTimeout: number = 10 * 1000;
    private _focusManager: FocusManager;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: VPAID;
    private _vpaidCampaign: VPAIDCampaign;
    private _timer: Timer;
    private _options: any;
    private _overlay: AbstractOverlay;

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
        this._overlay = parameters.overlay;

        this._overlay.render();
        this._overlay.setFadeEnabled(true);
        this._overlay.setSkipEnabled(false);
        this._overlay.setMuteEnabled(false);
        const overlayContainer = this._overlay.container();
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0px';
        overlayContainer.style.left = '0px';
        document.body.appendChild(overlayContainer);

        if (this._placement.allowSkip()) {
            parameters.overlay.setSkipEnabled(true);
            parameters.overlay.setSkipDuration(this._placement.allowSkipInSeconds());
        }

        if(this._vpaidCampaign.hasEndScreen() && parameters.endScreen) {
            parameters.endScreen.render();
            parameters.endScreen.hide();
            document.body.appendChild(parameters.endScreen.container());
        }

        this._timer = new Timer(() => this.onAdUnitNotLoaded(), VPAIDAdUnit._adLoadTimeout);

        this._onAppBackgroundHandler = () => this.onAppBackground();
        this._onAppForegroundHandler = () => this.onAppForeground();

        this._view.render();
    }

    public show(): Promise<void> {
        this.onShow();
        return this._container.open(this, ['webplayer'], false, this._forceOrientation, false, false, true, false, this._options);
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

    public getAdUnitNotLoadedTimer(): Timer {
        return this._timer;
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
        this._thirdPartyEventManager.sendEvent(eventType, sessionId, url);
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
        this._overlay.container().parentElement!.removeChild(this._overlay.container());

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
        document.body.appendChild(this._view.container());
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
}
