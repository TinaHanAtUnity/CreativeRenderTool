import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainerSystemMessage, IAdUnitContainerListener } from 'AdUnits/Containers/AdUnitContainer';
import { FinishState } from 'Constants/FinishState';
import { Platform } from 'Constants/Platform';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Placement } from 'Models/Placement';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { WKAudiovisualMediaTypes } from 'Native/Api/WebPlayer';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { IObserver2 } from 'Utilities/IObserver';
import { Timer } from 'Utilities/Timer';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Closer } from 'Views/Closer';
import { VPAID } from 'Views/VPAID';
import { VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { ClientInfo } from 'Models/ClientInfo';
import { CustomFeatures } from 'Utilities/CustomFeatures';
import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';

export interface IVPAIDAdUnitParameters extends IAdUnitParameters<VPAIDCampaign> {
    vpaid: VPAID;
    closer: Closer;
    endScreen?: VPAIDEndScreen | undefined;
    privacy: AbstractPrivacy;
}

export class VPAIDAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {

    public static setAdLoadTimeout(timeout: number) {
        VPAIDAdUnit._adLoadTimeout = timeout;
    }

    private static _adLoadTimeout: number = 7000;
    private _endScreen: VPAIDEndScreen | undefined;
    private _closer: Closer;
    private _placement: Placement;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: VPAID;
    private _vpaidCampaign: VPAIDCampaign;
    private _timer: Timer;
    private _options: any;
    private _deviceInfo: DeviceInfo;
    private _urlLoadingObserver: IObserver2<string, string>;
    private _privacyShowing = false;
    private _clientInfo: ClientInfo;
    private _webPlayerContainer: WebPlayerContainer;
    private _shouldFullScreenWebView = true;
    private _topWebViewAreaHeight: number;
    private readonly _topWebViewAreaMinHeight = 70;

    constructor(nativeBridge: NativeBridge, parameters: IVPAIDAdUnitParameters) {
        super(nativeBridge, parameters);

        this._vpaidCampaign = parameters.campaign;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._options = parameters.options;
        this._view = parameters.vpaid;
        this._closer = parameters.closer;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._clientInfo = parameters.clientInfo;
        this._webPlayerContainer = parameters.webPlayerContainer!;
        this._timer = new Timer(() => this.onAdUnitNotLoaded(), VPAIDAdUnit._adLoadTimeout);
        this._endScreen = parameters.endScreen;

        if (this._endScreen) {
            this._endScreen.render();
        }

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._topWebViewAreaHeight = Math.floor(this.getAndroidViewSize(this._topWebViewAreaMinHeight, this.getScreenDensity()));
        } else {
            this._topWebViewAreaHeight = this._topWebViewAreaMinHeight;
        }

        this._closer.render();
        this._closer.choosePrivacyShown();
    }

    public show(): Promise<void> {
        this.onShow();
        return this.setupWebPlayer().then(() => {
            this._urlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url, method) => this.onUrlLoad(url));
            this.setupPrivacyObservers();
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, false, false, true, false, this._options).then(() => {
                this.onStart.trigger();
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

    public openUrl(url: string | null) {
        if (url) {
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
        const urls = this._vpaidCampaign.getTrackingUrlsForEvent(eventType);
        const sessionId = this._vpaidCampaign.getSession().getId();

        for (const url of urls) {
            this._thirdPartyEventManager.sendEvent(`vpaid ${eventType}`, sessionId, url);
        }
    }

    public sendImpressionTracking() {
        const impressionUrls = this._vpaidCampaign.getImpressionUrls();
        const sessionId = this._vpaidCampaign.getSession().getId();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this._thirdPartyEventManager.sendEvent('vpaid impression', sessionId, impressionUrl);
            }
        }
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

    public onContainerShow(): void {
        this.setShowing(true);
        this.onContainerForeground();
    }

    public onContainerDestroy(): void {
        // EMPTY
    }

    public onContainerBackground(): void {
        this._view.pauseAd();

        if (this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.hide();
        }
    }

    public onContainerForeground(): void {
        this.showCloser();
        if (this._view.isLoaded() && !this._privacyShowing) {
            this._view.resumeAd();
        } else if (!this._view.isLoaded()) {
            this._view.loadWebPlayer();
        } else {
            // Popup will resume video
        }
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // EMPTY
    }

    public setWebViewSize(shouldFullScreen: boolean) {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
            if (shouldFullScreen) {
                return this._container.setViewFrame('webview', 0, 0, width, height);
            } else {
                return this._container.setViewFrame('webview', 0, 0, width, this._topWebViewAreaHeight);
            }
        });
    }

    private setupPrivacyObservers(): void {
        if (this._closer.onPrivacyClosed) {
            this._closer.onPrivacyClosed.subscribe(() => {
                this.setWebViewSize(!this._shouldFullScreenWebView);
                this._view.resumeAd();
                this._privacyShowing = false;
            });
        }
        if (this._closer.onPrivacyOpened) {
            this._closer.onPrivacyOpened.subscribe(() => {
                this.setWebViewSize(this._shouldFullScreenWebView);
                this._view.pauseAd();
                this._privacyShowing = true;
            });
        }
    }

    private setupWebPlayer(): Promise<any> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this.setupAndroidWebPlayer();
        } else {
            return this.setupIosWebPlayer();
        }
    }

    private setupAndroidWebPlayer(): Promise<{}> {
        const promises = [];
        promises.push(this._webPlayerContainer.setSettings({
            setSupportMultipleWindows: [false],
            setJavaScriptCanOpenWindowsAutomatically: [true],
            setMediaPlaybackRequiresUserGesture: [false]
        }, {}));
        const eventSettings = {
            'onPageStarted': { 'sendEvent': true },
            'shouldOverrideUrlLoading': { 'sendEvent': true, 'returnValue': true }
        };
        promises.push(this._webPlayerContainer.setEventSettings(eventSettings));
        return Promise.all(promises);
    }

    private setupIosWebPlayer(): Promise<any> {
        const settings = {
            'allowsPlayback': true,
            'playbackRequiresAction': false,
            'typesRequiringAction': WKAudiovisualMediaTypes.NONE
        };
        const events = {
            'onPageStarted': { 'sendEvent': true },
            'shouldOverrideUrlLoading': { 'sendEvent': true, 'returnValue': true }
        };
        return Promise.all([
            this._webPlayerContainer.setSettings(settings, {}),
            this._webPlayerContainer.setEventSettings(events)
        ]);
    }

    private onAdUnitNotLoaded() {
        this.setFinishState(FinishState.ERROR);
        Diagnostics.trigger('vpaid_load_timeout', new DiagnosticError(new Error('VPAID failed to load within timeout'), {
            id: this._vpaidCampaign.getId()
        }), this._vpaidCampaign.getSession());
        this.hide();
    }

    private onShow() {
        this._timer.start();
        this.setShowing(true);

        this._container.addEventHandler(this);
    }

    private onHide() {
        if (this._closer.container().parentElement) {
            this._closer.container().parentElement!.removeChild(this._closer.container());
        }

        this._timer.stop();
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._urlLoadingObserver);
        this._container.removeEventHandler(this);
    }

    private hideView() {
        this._view.mute();
        this._view.hide();
        this._closer.hide();
        if (this._endScreen && document.body.querySelector('#end-screen')) {
            this._endScreen.remove();
        }
    }

    private showCloser() {
        // When users background we dont want the endscreen to move to top of frame
        if (document.body.querySelector('#end-screen')) {
            return this.setWebViewSize(this._shouldFullScreenWebView);
        } else {
            return this.setWebViewSize(!this._shouldFullScreenWebView).then(() => {
                if (!this._closer.container().parentNode) {
                    document.body.appendChild(this._closer.container());
                }
            });
        }
    }

    private getAndroidViewSize(size: number, density: number): number {
        return size * (density / 160);
    }

    private getScreenDensity(): number {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return (<AndroidDeviceInfo>this._deviceInfo).getScreenDensity();
        }
        return 0;
    }

    private onUrlLoad(url: string) {
        if (url.indexOf('file://') !== 0 && url.indexOf('about:blank') !== 0) {
            this.openUrl(url);
        }
    }
}
