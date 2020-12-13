import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { EventType } from 'Ads/Models/Session';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export class MRAIDEventHandler extends GDPREventHandler {
    constructor(adUnit, parameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._mraidView = adUnit.getMRAIDView();
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._request = parameters.request;
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._deviceInfo = parameters.deviceInfo;
        this._customImpressionFired = false;
        this._gameSessionId = parameters.gameSessionId;
        this._abGroup = parameters.coreConfig.getAbGroup();
    }
    onMraidClick(url) {
        this._ads.Listener.sendClickEvent(this._placement.getId());
        return Promise.resolve();
    }
    onMraidReward() {
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }
    onMraidSkip() {
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }
    onMraidClose() {
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this._adUnit.hide();
    }
    onMraidOrientationProperties(orientationProperties) {
        if (this._adUnit.isShowing()) {
            if (this._platform === Platform.IOS) {
                this._adUnit.getContainer().reorient(true, orientationProperties.forceOrientation);
            }
            else {
                this._adUnit.getContainer().reorient(orientationProperties.allowOrientationChange, orientationProperties.forceOrientation);
            }
        }
        else {
            this._adUnit.setOrientationProperties(orientationProperties);
        }
    }
    onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, event, eventData) {
        const kafkaObject = {};
        kafkaObject.type = event;
        kafkaObject.eventData = eventData;
        kafkaObject.timeFromShow = timeFromShow;
        kafkaObject.timeFromPlayableStart = timeFromPlayableStart;
        kafkaObject.backgroundTime = backgroundTime;
        const resourceUrl = this._campaign.getResourceUrl();
        if (resourceUrl) {
            kafkaObject.url = resourceUrl.getOriginalUrl();
        }
        kafkaObject.auctionId = this._campaign.getSession().getId();
        kafkaObject.abGroup = this._coreConfig.getAbGroup();
        kafkaObject.targetGameId = this._campaign.getTargetGameId();
        kafkaObject.campaignId = this._campaign.getId();
        HttpKafka.sendEvent('ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
    onMraidShowEndScreen() {
        const endScreen = this._adUnit.getEndScreen();
        if (endScreen) {
            this._adUnit.setShowingMRAID(false);
            this._adUnit.getMRAIDView().hide();
            endScreen.show();
        }
    }
    onCustomImpressionEvent() {
        if (!this._customImpressionFired) {
            this._adUnit.sendImpression();
            this._customImpressionFired = true;
        }
    }
    onWebViewFullScreen() {
        return Promise.resolve();
    }
    onWebViewReduceSize() {
        return Promise.resolve();
    }
    sendTrackingEvents() {
        const operativeEventParams = this.getOperativeEventParams();
        if (!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
            this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            this._adUnit.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
        }
        if (!this._campaign.getSession().getEventSent(EventType.VIEW)) {
            this._operativeEventManager.sendView(operativeEventParams);
            this._adUnit.sendTrackingEvent(TrackingEvent.COMPLETE);
        }
        if (!this._campaign.getSession().getEventSent(EventType.CLICK)) {
            this._operativeEventManager.sendClick(operativeEventParams);
        }
        this._adUnit.sendClick();
    }
    openUrl(url) {
        if (this._platform === Platform.IOS) {
            return this._core.iOS.UrlScheme.open(url);
        }
        else {
            return this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url // todo: these come from 3rd party sources, should be validated before general MRAID support
            });
        }
    }
    getOperativeEventParams() {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }
    onUseCustomClose(hideClose) {
        this._mraidView.onUseCustomClose(hideClose);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvRXZlbnRIYW5kbGVycy9NUkFJREV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUd0RSxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTVGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBUW5ELE9BQU8sRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUc1RSxNQUFNLE9BQU8saUJBQWtCLFNBQVEsZ0JBQWdCO0lBa0JuRCxZQUFZLE1BQW1CLEVBQUUsVUFBa0M7UUFDL0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDO1FBQy9ELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUM7UUFDakUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFH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