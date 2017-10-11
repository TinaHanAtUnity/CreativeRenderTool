import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDHandler, VPAID } from 'Views/VPAID';
import { FinishState } from 'Constants/FinishState';
import { Platform } from 'Constants/Platform';
import { Url } from 'Utilities/Url';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Timer } from 'Utilities/Timer';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { FocusManager } from 'Managers/FocusManager';
import { IVPAIDEndScreenHandler, VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { IOverlayHandler, Overlay } from 'Views/Overlay';

export interface IVPAIDAdUnitParameters<T extends IVPAIDEndScreenHandler, T2 extends IVPAIDHandler, T3 extends IOverlayHandler> extends IAdUnitParameters {
    vpaid: VPAID;
    endScreen?: VPAIDEndScreen;
    overlay: Overlay;
    endScreenHandler?: { new(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IAdUnitParameters): T; };
    vpaidEventHandler: { new(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IVPAIDAdUnitParameters<IVPAIDEndScreenHandler, IVPAIDHandler, IOverlayHandler>): T2; };
    overlayEventHandler: { new(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IAdUnitParameters): T3; };
}

export class VPAIDAdUnit extends AbstractAdUnit {

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
    private _vpaidEventHandler: IVPAIDHandler;
    private _vpaidEndScreenEventHandler: IVPAIDEndScreenHandler;
    private _overlayEventHandler: IOverlayHandler;

    private _onAppForegroundHandler: any;
    private _onAppBackgroundHandler: any;

    constructor(nativeBridge: NativeBridge, parameters: IVPAIDAdUnitParameters<IVPAIDEndScreenHandler, IVPAIDHandler, IOverlayHandler>) {
        super(nativeBridge, parameters.forceOrientation, parameters.container, parameters.placement, parameters.campaign);

        this._focusManager = parameters.focusManager;
        this._vpaidCampaign = <VPAIDCampaign>parameters.campaign;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._options = parameters.options;

        this._view = parameters.vpaid;
        this._vpaidEventHandler = new parameters.vpaidEventHandler(nativeBridge, this, parameters);
        this._view.addHandler(this._vpaidEventHandler);
        this._view.render();

        if(this._vpaidCampaign.hasEndScreen() && parameters.endScreen) {
            if(parameters.endScreenHandler) {
                this._vpaidEndScreenEventHandler = new parameters.endScreenHandler(nativeBridge, this, parameters);
                parameters.endScreen.addHandler(this._vpaidEndScreenEventHandler);
            }
            parameters.endScreen.render();
        }

        this._timer = new Timer(() => this.onAdUnitNotLoaded(), VPAIDAdUnit._adLoadTimeout);

        this._onAppBackgroundHandler = () => this.onAppBackground();
        this._onAppForegroundHandler = () => this.onAppForeground();

        const overlayContainer = parameters.overlay.container();
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0px';
        overlayContainer.style.left = '0px';
        this._view.container().insertBefore(overlayContainer, this._view.container().lastChild);

        this._overlayEventHandler = new parameters.overlayEventHandler(nativeBridge, this, parameters);
        parameters.overlay.addHandler(this._overlayEventHandler);
        parameters.overlay.render();
        parameters.overlay.setSkipEnabled(false);
        parameters.overlay.setMuteEnabled(false);

        if (this._placement.allowSkip()) {
            parameters.overlay.setSkipEnabled(true);
            parameters.overlay.setSkipDuration(this._placement.allowSkipInSeconds());
        }
        parameters.overlay.setFadeEnabled(true);
    }

    public show(): Promise<void> {
        this.onShow();
        this.showView();
        return this._container.open(this, false, false, this._forceOrientation, false, false, true, false, this._options);
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
        }));
        this.hide();
    }

    private onShow() {
        this.setShowing(true);
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
        document.body.removeChild(this._view.container());
    }

    private onAppForeground() {
        this._view.resumeAd();
    }

    private onAppBackground() {
        this._view.pauseAd();
    }
}
