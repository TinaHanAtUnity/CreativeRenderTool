import { IVPAIDHandler, VPAID } from 'Views/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { Closer } from 'Views/Closer';
import { GameSessionStats } from "../Utilities/GameSessionStats";

export class VPAIDEventHandler implements IVPAIDHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _comScoreTrackingService: ComScoreTrackingService;
    private _adUnit: VPAIDAdUnit;
    private _vpaidEventHandlers: { [key: string]: () => void; } = {};
    private _vpaidCampaign: VPAIDCampaign;
    private _placement: Placement;
    private _vpaidEndScreen: VPAIDEndScreen | undefined;
    private _closer: Closer;
    private _adDuration: number = -2;
    private _adRemainingTime: number = -2;
    private _abGroup: number;
    private _campaign: VPAIDCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._comScoreTrackingService = parameters.comScoreTrackingService;
        this._adUnit = adUnit;
        this._vpaidCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._closer = parameters.closer;
        this._vpaidEndScreen = parameters.endScreen;
        this._abGroup = parameters.campaign.getAbGroup();
        this._campaign = parameters.campaign;

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
        this._nativeBridge.Sdk.logDebug(`vpaid event ${eventType} with args ${args && args.length ? args.join(' ') : 'None'}`);
        const handler = this._vpaidEventHandlers[eventType];
        if (handler) {
            handler.apply(this, args);
        }
    }

    public onVPAIDCompanionClick() {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this._adUnit.openUrl(url);
    }

    public onVPAIDCompanionView() {
        const companion = this._vpaidCampaign.getCompanionAd();
        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this._adUnit.sendThirdPartyEvent('vpaid companion creativeView', url);
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

    public onVPAIDProgress(duration: number, remainingTime: number) {
        this._adDuration = duration;
        this._adRemainingTime = remainingTime;
        if ((duration && duration !== -2) && (remainingTime && remainingTime !== -2)) {
            this._closer.update(duration - remainingTime, duration);
        }
    }

    public getDuration() {
        return this._adDuration;
    }

    public getPlayTime() {
        return (this._adDuration - this._adRemainingTime) * 1000;
    }

    private onAdLoaded() {
        this._adUnit.onAdLoaded();
        this.onVPAIDProgress(this._adDuration, this._adRemainingTime);
    }

    private onAdError() {
        this._adUnit.sendTrackingEvent('error');
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }

    private onAdSkipped() {
        this._adUnit.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._placement);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    private onAdStopped() {
        if (this._vpaidCampaign.hasEndScreen() && this._vpaidEndScreen) {
            this._vpaidEndScreen.show();
        } else {
            this._adUnit.hide();
        }
    }

    private onAdStarted() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._adUnit.sendTrackingEvent('creativeView');
        this._operativeEventManager.sendStart(this._placement).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });
        this.sendComscoreEvent('play', 0);
    }

    private onAdImpression() {
        this._adUnit.sendTrackingEvent('impression');
        this._adUnit.sendImpressionTracking();
    }

    private onAdVideoStart() {
        this._adUnit.sendTrackingEvent('start');
    }

    private onAdVideoFirstQuartile() {
        this._adUnit.sendTrackingEvent('firstQuartile');
        this._operativeEventManager.sendFirstQuartile(this._placement);
    }

    private onAdVideoMidpoint() {
        this._adUnit.sendTrackingEvent('midpoint');
        this._operativeEventManager.sendMidpoint(this._placement);
    }

    private onAdVideoThirdQuartile() {
        this._adUnit.sendTrackingEvent('thirdQuartile');
        this._operativeEventManager.sendThirdQuartile(this._placement);
    }

    private onAdVideoComplete() {
        this._adUnit.sendTrackingEvent('complete');
        this._adUnit.setFinishState(FinishState.COMPLETED);
        GameSessionStats.addNewView(this._placement, this._campaign);
        this._operativeEventManager.sendView(this._placement);
        this.sendComscoreEvent('end', (this._adDuration - this._adRemainingTime) * 1000);
    }

    private onAdPaused() {
        if (this._adUnit.getFinishState() === FinishState.COMPLETED) {
            this.onAdStopped();
        } else {
            this._adUnit.sendTrackingEvent('paused');
        }
    }

    private onAdPlaying() {
        this._adUnit.sendTrackingEvent('resume');
    }

    private onAdClickThru(url?: string, id?: string, playerHandles?: boolean) {
        this.sendClickTrackingEvents();
        if (playerHandles) {
            if (url) {
                this._adUnit.openUrl(url);
            } else {
                this._adUnit.openUrl(this.getClickThroughURL());
            }
        }
    }

    private onAdDurationChange() {
        this.onVPAIDProgress(this._adDuration, this._adRemainingTime);
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
            this._adUnit.sendThirdPartyEvent('vpaid video click', url);
        }
    }

    private sendComscoreEvent(eventName: string, position: number) {
        const sessionId = this._vpaidCampaign.getSession().getId();
        const creativeId = this._vpaidCampaign.getCreativeId();
        const category = this._vpaidCampaign.getCategory();
        const subCategory = this._vpaidCampaign.getSubcategory();
        let adDuration = (this._adDuration * 1000);

        if (adDuration < 0 || typeof adDuration === 'undefined') {
            adDuration = 0;
        }

        this._comScoreTrackingService.sendEvent(eventName, sessionId, adDuration.toString(10), position, creativeId, category, subCategory);
    }
}
