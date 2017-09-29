import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { VPAID } from 'Views/VPAID';
import { FinishState } from 'Constants/FinishState';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { Url } from 'Utilities/Url';

export class VPAIDAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _view: VPAID;
    private _vpaidEventHandlers: { [eventName: string]: () => void; } = {};
    private _vpaidCampaign: VPAIDCampaign;

    constructor(view: VPAID, nativeBridge: NativeBridge, sessionManager: SessionManager, forceOrientation: ForceOrientation, container: AdUnitContainer, placement: Placement, campaign: VPAIDCampaign) {
        super(nativeBridge, forceOrientation, container, placement, campaign);

        this._vpaidCampaign = campaign;
        this._sessionManager = sessionManager;

        this._view = view;
        this._view.onVPAIDEvent.subscribe((eventType: string, args: any[]) => this.onVPAIDEvent(eventType, args));

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
    }

    public show(): Promise<void> {
        this.onShow();
        this.showView();
        return this._container.open(this, false, false, this._forceOrientation, false, false, true, false, {});
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
        return true;
    }

    private onShow() {
        this.setShowing(true);
    }

    private onHide() {
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
        const handler = this._vpaidEventHandlers[eventType];
        if (handler) {
            handler.apply(this, args);
        }
    }

    private onAdLoaded() {
        this._view.showAd();
    }

    private onAdError() {
        this.sendTrackingEvent('error');
        this.setFinishState(FinishState.ERROR);
        this.hide();
    }

    private onAdSkipped() {
        this.sendTrackingEvent('skip');
        this._sessionManager.sendSkip(this);
        this.setFinishState(FinishState.SKIPPED);
        this.hide();
    }

    private onAdStopped() {
        this.hide();
    }

    private onAdStarted() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent('creativeView');
        this._sessionManager.sendStart(this);
    }

    private onAdImpression() {
        this.sendTrackingEvent('impression');
    }

    private onAdVideoStart() {
        this.sendTrackingEvent('start');
    }

    private onAdVideoFirstQuartile() {
        this.sendTrackingEvent('firstQuartile');
        this._sessionManager.sendFirstQuartile(this);
    }

    private onAdVideoMidpoint() {
        this.sendTrackingEvent('midpoint');
        this._sessionManager.sendMidpoint(this);
    }

    private onAdVideoThirdQuartile() {
        this.sendTrackingEvent('thirdQuartile');
        this._sessionManager.sendThirdQuartile(this);
    }

    private onAdVideoComplete() {
        this.sendTrackingEvent('complete');
        this.setFinishState(FinishState.COMPLETED);
        this._sessionManager.sendView(this);
    }

    private onAdPaused() {
        this.sendTrackingEvent('paused');
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
        const sdkVersion = this._sessionManager.getClientInfo().getSdkVersion();
        url = url.replace(/%ZONE%/, this.getPlacement().getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._sessionManager.getEventManager().thirdPartyEvent(eventType, sessionId, url);
    }
}
