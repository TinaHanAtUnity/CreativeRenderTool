import { IVPAIDHandler, VPAID } from 'Views/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { IVPAIDEndScreenHandler } from 'Views/VPAIDEndScreen';
import { IOverlayHandler } from 'Views/Overlay';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { Platform } from 'Constants/Platform';

export class VPAIDEventHandler implements IVPAIDHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adUnit: VPAIDAdUnit;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vpaidEventHandlers: { [eventName: string]: () => void; } = {};
    private _vpaidCampaign: VPAIDCampaign;
    private _placement: Placement;
    private _vpaidView: VPAID;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters<IVPAIDEndScreenHandler, IVPAIDHandler, IOverlayHandler>) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._vpaidCampaign = <VPAIDCampaign>parameters.campaign;
        this._placement = parameters.placement;
        this._vpaidView = parameters.vpaid;

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
    }

    public onVPAIDEvent(eventType: string, args: any[]) {
        this._nativeBridge.Sdk.logInfo(`vpaid event ${eventType} with args ${args && args.length ? args.join(' '): 'None'}`);
        const handler = this._vpaidEventHandlers[eventType];
        if (handler) {
            handler.apply(this, args);
        }
    }

    public onVPAIDCompanionClick() {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this.openUrl(url);
    }

    public onVPAIDCompanionView() {
        const companion = this._vpaidCampaign.getCompanionAd();
        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this.sendThirdPartyEvent('vpaid companion creativeView', url);
            }
        }
    }

    public onVPAIDStuck() {
        Diagnostics.trigger('vpaid_ad_stuck', new DiagnosticError(new Error('Ad playback stuck'), {
            campaignId: this._vpaidCampaign.getId()
        }));
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }

    public onVPAIDSkip() {
        this.onAdSkipped();
    }

    private onAdSkipped() {
        this.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._adUnit);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    private onAdStarted() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent('creativeView');
        this._operativeEventManager.sendStart(this._adUnit);
    }

    private onAdImpression() {
        this.sendTrackingEvent('impression');
    }

    private onAdVideoStart() {
        this.sendTrackingEvent('start');
    }

    private onAdVideoFirstQuartile() {
        this.sendTrackingEvent('firstQuartile');
        this._operativeEventManager.sendFirstQuartile(this._adUnit);
    }

    private onAdVideoMidpoint() {
        this.sendTrackingEvent('midpoint');
        this._operativeEventManager.sendMidpoint(this._adUnit);
    }

    private onAdVideoThirdQuartile() {
        this.sendTrackingEvent('thirdQuartile');
        this._operativeEventManager.sendThirdQuartile(this._adUnit);
    }

    private onAdVideoComplete() {
        this.sendTrackingEvent('complete');
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this._operativeEventManager.sendView(this._adUnit);
    }

    private onAdPaused() {
        if (this._adUnit.getFinishState() === FinishState.COMPLETED) {
            this.onAdStopped();
        } else {
            this.sendTrackingEvent('paused');
        }
    }

    private onAdLoaded() {
        this._timer.stop();
        this._view.updateTimeoutWidget();
        this._vpaidView.showAd();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
    }

    private onAdError() {
        this.sendTrackingEvent('error');
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }

    private onAdStopped() {
        if (this._vpaidCampaign.hasEndScreen()) {
            this._view.showEndScreen();
        } else {
            this.hide();
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
        url = url.replace(/%ZONE%/, this._placement.getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._thirdPartyEventManager.sendEvent(eventType, sessionId, url);
    }
}
