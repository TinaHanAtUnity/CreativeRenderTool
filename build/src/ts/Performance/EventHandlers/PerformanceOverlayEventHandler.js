import { OverlayEventHandlerWithDownloadSupport } from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export class PerformanceOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport {
    constructor(adUnit, parameters, storeHandler) {
        super(adUnit, parameters, storeHandler, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }
    onOverlayDownload(parameters) {
        super.onOverlayDownload(parameters);
        this.sendClickEventToKafka(parameters);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.CLICK);
    }
    sendClickEventToKafka(parameters) {
        const currentSession = this._campaign.getSession();
        const kafkaObject = {};
        kafkaObject.type = 'performance_video_overlay_cta_button_click';
        kafkaObject.auctionId = currentSession.getId();
        kafkaObject.rating = this._campaign.getRating();
        kafkaObject.number1 = parameters.videoDuration / 1000;
        kafkaObject.number2 = parameters.videoProgress / 1000;
        kafkaObject.number3 = parameters.videoProgress / parameters.videoDuration;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
    onOverlaySkip(position) {
        if (this._placement.skipEndCardOnClose()) {
            super.onOverlayClose();
        }
        else {
            super.onOverlaySkip(position);
            const endScreen = this._performanceAdUnit.getEndScreen();
            if (endScreen) {
                endScreen.show();
            }
            this._performanceAdUnit.onFinish.trigger();
        }
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.SKIP);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VPdmVybGF5RXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1BlcmZvcm1hbmNlL0V2ZW50SGFuZGxlcnMvUGVyZm9ybWFuY2VPdmVybGF5RXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFSCxzQ0FBc0MsRUFDekMsTUFBTSwwREFBMEQsQ0FBQztBQUNsRSxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSTVGLE9BQU8sRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUU1RSxNQUFNLE9BQU8sOEJBQStCLFNBQVEsc0NBQTJEO0lBSzNHLFlBQVksTUFBeUIsRUFBRSxVQUF3QyxFQUFFLFlBQTJCO1FBQ3hHLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQztRQUNqQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDO0lBQ3JFLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxVQUEyQztRQUNoRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVPLHFCQUFxQixDQUFDLFVBQTJDO1FBQ3JFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbkQsTUFBTSxXQUFXLEdBQStCLEVBQUUsQ0FBQztRQUNuRCxXQUFXLENBQUMsSUFBSSxHQUFHLDRDQUE0QyxDQUFDO1FBQ2hFLFdBQVcsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9DLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoRCxXQUFXLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQ3RELFdBQVcsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDdEQsV0FBVyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDMUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxzQ0FBc0MsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDOUcsQ0FBQztJQUVNLGFBQWEsQ0FBQyxRQUFnQjtRQUNqQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtZQUN0QyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDMUI7YUFBTTtZQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3pELElBQUksU0FBUyxFQUFFO2dCQUNYLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNwQjtZQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDOUM7UUFDRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FDSiJ9