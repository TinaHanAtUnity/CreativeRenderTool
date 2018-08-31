import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { Closer } from 'Ads/Views/Closer';
import { IVPAIDHandler } from 'Ads/Views/VPAID';
import { VPAIDEndScreen } from 'Ads/Views/VPAIDEndScreen';
import { FinishState } from 'Common/Constants/FinishState';
import { DiagnosticError } from 'Common/Errors/DiagnosticError';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';

export class VPAIDEventHandler implements IVPAIDHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adUnit: VPAIDAdUnit;
    private _vpaidEventHandlers: { [key: string]: () => void } = {};
    private _vpaidCampaign: VPAIDCampaign;
    private _placement: Placement;
    private _vpaidEndScreen: VPAIDEndScreen | undefined;
    private _closer: Closer;
    private _adDuration: number = -2;
    private _adRemainingTime: number = -2;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._vpaidCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._closer = parameters.closer;
        this._vpaidEndScreen = parameters.endScreen;

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
        let argsCopy: any[] | undefined;
        if(args) {
            argsCopy = Array.prototype.slice.call(args);
        }

        this._nativeBridge.Sdk.logDebug(`vpaid event ${eventType} with args ${argsCopy && argsCopy.length ? argsCopy.join(' ') : 'None'}`);
        const handler = this._vpaidEventHandlers[eventType];
        if (handler) {
            if(argsCopy && argsCopy.length && argsCopy instanceof Array) {
                handler.apply(this, argsCopy);
            } else {
                handler.call(this);
            }
        }
    }

    public onVPAIDCompanionClick() {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this._adUnit.openUrl(url);
    }

    public onVPAIDCompanionView() {
        const companion = this._vpaidCampaign.getCompanionAd();
        const sessionId = this._vpaidCampaign.getSession().getId();

        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this._thirdPartyEventManager.sendEvent('vpaid companion creativeView', sessionId, url);
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
        this._operativeEventManager.sendSkip(this.getOperativeEventParams());
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.mute();
        this._adUnit.hide();
    }

    private onAdStopped() {
        if (this._vpaidCampaign.hasEndScreen()) {
            const shouldFullScreenWebview = true;
            this._adUnit.setWebViewSize(shouldFullScreenWebview).then(() => {
                if (this._vpaidEndScreen) {
                    this._vpaidEndScreen.show();
                    (<HTMLElement>this._closer.container().querySelector('.close-region')).style.visibility = 'hidden';
                    (<HTMLElement>this._closer.container().querySelector('.gdpr-pop-up')).style.visibility = 'hidden';
                }
            });
        } else {
            this._adUnit.hide();
        }
    }

    private onAdStarted() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._adUnit.sendTrackingEvent('creativeView');
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });
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
        this._operativeEventManager.sendFirstQuartile(this.getOperativeEventParams());
    }

    private onAdVideoMidpoint() {
        this._adUnit.sendTrackingEvent('midpoint');
        this._operativeEventManager.sendMidpoint(this.getOperativeEventParams());
    }

    private onAdVideoThirdQuartile() {
        this._adUnit.sendTrackingEvent('thirdQuartile');
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }

    private onAdVideoComplete() {
        this._adUnit.sendTrackingEvent('complete');
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this._operativeEventManager.sendView(this.getOperativeEventParams());
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
        const sessionId = this._vpaidCampaign.getSession().getId();

        for (const url of urls) {
            this._thirdPartyEventManager.sendEvent('vpaid video click', sessionId, url);
        }
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement
        };
    }
}
