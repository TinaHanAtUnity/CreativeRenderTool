import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { FinishState } from 'Core/Constants/FinishState';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
export class VPAIDEventHandler {
    constructor(adUnit, parameters) {
        this._vpaidEventHandlers = {};
        this._adDuration = -2;
        this._adRemainingTime = -2;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._vpaidCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._closer = parameters.closer;
        this._vpaidEndScreen = parameters.endScreen;
        this._core = parameters.core;
        this._ads = parameters.ads;
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
    onVPAIDEvent(eventType, args) {
        let argsCopy;
        if (args) {
            argsCopy = Array.prototype.slice.call(args);
        }
        this._core.Sdk.logDebug(`vpaid event ${eventType} with args ${argsCopy && argsCopy.length ? argsCopy.join(' ') : 'None'}`);
        const handler = this._vpaidEventHandlers[eventType];
        if (handler) {
            if (argsCopy && argsCopy.length && argsCopy instanceof Array) {
                handler.apply(this, argsCopy);
            }
            else {
                handler.call(this);
            }
        }
    }
    onVPAIDCompanionClick() {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this._adUnit.openUrl(url);
    }
    onVPAIDCompanionView() {
        const companion = this._vpaidCampaign.getCompanionAd();
        const sessionId = this._vpaidCampaign.getSession().getId();
        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this._thirdPartyEventManager.sendWithGet('vpaid companion creativeView', sessionId, url);
            }
        }
    }
    onVPAIDStuck() {
        Diagnostics.trigger('vpaid_ad_stuck', new DiagnosticError(new Error('Ad playback stuck'), {
            campaignId: this._vpaidCampaign.getId()
        }));
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }
    onVPAIDSkip() {
        this.onAdSkipped();
    }
    onVPAIDProgress(duration, remainingTime) {
        this._adDuration = duration;
        this._adRemainingTime = remainingTime;
        if ((duration && duration !== -2) && (remainingTime && remainingTime !== -2)) {
            this._closer.update(duration - remainingTime, duration);
        }
    }
    getDuration() {
        return this._adDuration;
    }
    getPlayTime() {
        return (this._adDuration - this._adRemainingTime) * 1000;
    }
    onAdLoaded() {
        this._adUnit.onAdLoaded();
        this.onVPAIDProgress(this._adDuration, this._adRemainingTime);
    }
    onAdError() {
        this._adUnit.sendTrackingEvent(TrackingEvent.ERROR);
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }
    onAdSkipped() {
        this._adUnit.sendTrackingEvent(TrackingEvent.SKIP);
        this._operativeEventManager.sendSkip(this.getOperativeEventParams());
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.mute();
        this._adUnit.hide();
    }
    onAdStopped() {
        if (this._vpaidCampaign.hasEndScreen()) {
            const shouldFullScreenWebview = true;
            this._adUnit.setWebViewSize(shouldFullScreenWebview).then(() => {
                if (this._vpaidEndScreen) {
                    this._vpaidEndScreen.show();
                    this._closer.container().querySelector('.close-region').style.visibility = 'hidden';
                    this._closer.container().querySelector('.gdpr-pop-up').style.visibility = 'hidden';
                }
            });
        }
        else {
            this._adUnit.hide();
        }
    }
    onAdStarted() {
        this._ads.Listener.sendStartEvent(this._placement.getId());
        this._adUnit.sendTrackingEvent(TrackingEvent.CREATIVE_VIEW);
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });
    }
    onAdImpression() {
        this._adUnit.sendTrackingEvent(TrackingEvent.IMPRESSION);
        this._adUnit.sendImpressionTracking();
    }
    onAdVideoStart() {
        this._adUnit.sendTrackingEvent(TrackingEvent.START);
    }
    onAdVideoFirstQuartile() {
        this._adUnit.sendTrackingEvent(TrackingEvent.FIRST_QUARTILE);
        this._operativeEventManager.sendFirstQuartile(this.getOperativeEventParams());
    }
    onAdVideoMidpoint() {
        this._adUnit.sendTrackingEvent(TrackingEvent.MIDPOINT);
        this._operativeEventManager.sendMidpoint(this.getOperativeEventParams());
    }
    onAdVideoThirdQuartile() {
        this._adUnit.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }
    onAdVideoComplete() {
        this._adUnit.sendTrackingEvent(TrackingEvent.COMPLETE);
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this._operativeEventManager.sendView(this.getOperativeEventParams());
    }
    onAdPaused() {
        if (this._adUnit.getFinishState() === FinishState.COMPLETED) {
            this.onAdStopped();
        }
        else {
            this._adUnit.sendTrackingEvent(TrackingEvent.PAUSED);
        }
    }
    onAdPlaying() {
        this._adUnit.sendTrackingEvent(TrackingEvent.RESUME);
    }
    onAdClickThru(url, id, playerHandles) {
        this.sendClickTrackingEvents();
        if (playerHandles) {
            if (url) {
                this._adUnit.openUrl(url);
            }
            else {
                this._adUnit.openUrl(this.getClickThroughURL());
            }
        }
    }
    onAdDurationChange() {
        this.onVPAIDProgress(this._adDuration, this._adRemainingTime);
    }
    getCompanionClickThroughURL() {
        return this._vpaidCampaign.getCompanionClickThroughURL();
    }
    getClickThroughURL() {
        return this._vpaidCampaign.getVideoClickThroughURL();
    }
    sendClickTrackingEvents() {
        const urls = this._vpaidCampaign.getVideoClickTrackingURLs();
        const sessionId = this._vpaidCampaign.getSession().getId();
        for (const url of urls) {
            this._thirdPartyEventManager.sendWithGet('vpaid video click', sessionId, url);
        }
    }
    getOperativeEventParams() {
        return {
            placement: this._placement
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvRXZlbnRIYW5kbGVycy9WUEFJREV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRzVGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFOUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBaUJ6RCxNQUFNLE9BQU8saUJBQWlCO0lBYzFCLFlBQVksTUFBbUIsRUFBRSxVQUF3QztRQVZqRSx3QkFBbUIsR0FBb0QsRUFBRSxDQUFDO1FBSzFFLGdCQUFXLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDekIscUJBQWdCLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFLbEMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQztRQUMvRCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDO1FBQ2pFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBRTNCLElBQUks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