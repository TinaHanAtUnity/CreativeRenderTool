import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
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

export class VPAIDAdUnit extends AbstractAdUnit {

    public static setAdLoadTimeout(timeout: number) {
        VPAIDAdUnit._adLoadTimeout = timeout;
    }

    private static _adLoadTimeout: number = 10 * 1000;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: VPAID;
    private _vpaidEventHandlers: { [eventName: string]: () => void; } = {};
    private _vpaidCampaign: VPAIDCampaign;
    private _timer: Timer;
    private _options: any;

    constructor(view: VPAID, nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, forceOrientation: ForceOrientation, container: AdUnitContainer, placement: Placement, campaign: VPAIDCampaign, options: any) {
        super(nativeBridge, forceOrientation, container, placement, campaign);

        this._vpaidCampaign = campaign;
        this._operativeEventManager = operativeEventManager;
        this._thirdPartyEventManager = thirdPartyEventManager;
        this._options = options;

        this._view = view;
        this._view.onVPAIDEvent.subscribe((eventType: string, args: any[]) => this.onVPAIDEvent(eventType, args));
        this._view.onCompanionClick.subscribe(() => this.onCompanionClick());
        this._view.onCompanionView.subscribe(() => this.onCompanionView());

        if (campaign.hasEndScreen()) {
            this._view.endScreen.onClick.subscribe(() => this.onCompanionClick());
            this._view.endScreen.onClose.unsubscribe(() => this.onEndScreenClose());
        }

        this._vpaidEventHandlers.AdError = this.onAdError;
        this._vpaidEventHandlers.AdLoaded = this.onAdLoaded;
        this._vpaidEventHandlers.AdStarted = this.onAdStarted;
        this._vpaidEventHandlers.AdStopped = this.onAdStopped;
        this._vpaidEventHandlers.AdSkipped = this.onAdSkipped;
        this._vpaidEventHandlers.AdImpression = this.onAdImpression;
        this._vpaidEventHandlers.AdVideoStart = this.onAdVideoStart;
        this._vpaidEventHandlers.AdVideoFirstQuartile = this.onAdVideoFirstQuartile;
        this._vpaidEventHandlers.AdVideoMidpoint = this.onAdVideoMidpoint;
        this._vpaidEventHandlers.AdVideoThirdQuartile = this.onAdVideoThirdQuartile;
        this._vpaidEventHandlers.AdVideoComplete = this.onAdVideoComplete;
        this._vpaidEventHandlers.AdPaused = this.onAdPaused;
        this._vpaidEventHandlers.AdPlaying = this.onAdPlaying;
        this._vpaidEventHandlers.AdClickThru = this.onAdClickThru;
        this._vpaidEventHandlers.AdDurationChange = this.onAdDurationChange;

        this._timer = new Timer(() => this.onAdUnitNotLoaded(), VPAIDAdUnit._adLoadTimeout);
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
    }

    private onHide() {
        this._timer.stop();
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }

    private hideView() {
        this._view.hide();
        document.body.removeChild(this._view.container());
    }

    private onVPAIDEvent(eventType: string, args: any[]) {
        this._nativeBridge.Sdk.logInfo(`vpaid event ${eventType} with args ${args && args.length ? args.join(' '): 'None'}`);
        const handler = this._vpaidEventHandlers[eventType];
        if (handler) {
            handler.apply(this, args);
        }
    }

    private onAdLoaded() {
        this._timer.stop();
        this._view.updateTimeoutWidget();
        this._view.showAd();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
    }

    private onAdError() {
        this.sendTrackingEvent('error');
        this.setFinishState(FinishState.ERROR);
        this.hide();
    }

    private onAdSkipped() {
        this.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this);
        this.setFinishState(FinishState.SKIPPED);
        this.hide();
    }

    private onAdStopped() {
        if (this._vpaidCampaign.hasEndScreen()) {
            this._view.showEndScreen();
        } else {
            this.hide();
        }
    }

    private onEndScreenClose() {
        this.hide();
    }

    private onAdStarted() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent('creativeView');
        this._operativeEventManager.sendStart(this);
    }

    private onAdImpression() {
        this.sendTrackingEvent('impression');
    }

    private onAdVideoStart() {
        this.sendTrackingEvent('start');
    }

    private onAdVideoFirstQuartile() {
        this.sendTrackingEvent('firstQuartile');
        this._operativeEventManager.sendFirstQuartile(this);
    }

    private onAdVideoMidpoint() {
        this.sendTrackingEvent('midpoint');
        this._operativeEventManager.sendMidpoint(this);
    }

    private onAdVideoThirdQuartile() {
        this.sendTrackingEvent('thirdQuartile');
        this._operativeEventManager.sendThirdQuartile(this);
    }

    private onAdVideoComplete() {
        this.sendTrackingEvent('complete');
        this.setFinishState(FinishState.COMPLETED);
        this._operativeEventManager.sendView(this);
    }

    private onAdPaused() {
        if (this.getFinishState() === FinishState.COMPLETED) {
            this.onAdStopped();
        } else {
            this.sendTrackingEvent('paused');
        }
    }

    private onAdPlaying() {
        this.sendTrackingEvent('resume');
    }

    private onAdClickThru(url?: string, id?: string, playerHandles?: boolean) {
        this.sendClickTrackingEvents();
        if (playerHandles) {
            if (url) {
                this.openUrl(url);
            } else {
                this.openUrl(this.getClickThroughURL());
            }
        }
    }

    private onAdDurationChange() {
        this._view.updateTimeoutWidget();
    }

    private openUrl(url: string | null) {
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

    private onCompanionClick() {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this.openUrl(url);
    }

    private onCompanionView() {
        const companion = this._vpaidCampaign.getCompanionAd();
        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this.sendThirdPartyEvent('vpaid companion creativeView', url);
            }
        }
    }

    private getCompanionClickThroughURL(): string | null {
        return this._vpaidCampaign.getCompanionClickThroughURL();
    }

    private getClickThroughURL(): string | null {
        return this._vpaidCampaign.getVideoClickThroughURL();
    }

    private sendClickTrackingEvents() {
        const urls = this._vpaidCampaign.getVideoClickTrackingURLs();
        for (const url of urls) {
            this.sendThirdPartyEvent('vpaid video click', url);
        }
    }

    private sendTrackingEvent(eventType: string) {
        const urls = this._vpaidCampaign.getTrackingEventUrls(eventType);

        for (const url of urls) {
            this.sendThirdPartyEvent(`vpaid ${eventType}`, url);
        }
    }

    private sendThirdPartyEvent(eventType: string, url: string) {
        const sessionId = this._vpaidCampaign.getSession().getId();
        const sdkVersion = this._operativeEventManager.getClientInfo().getSdkVersion();
        url = url.replace(/%ZONE%/, this.getPlacement().getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._thirdPartyEventManager.sendEvent(eventType, sessionId, url);
    }
}
