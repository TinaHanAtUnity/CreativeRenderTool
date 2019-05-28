import {
    IVideoOverlayDownloadParameters,
    OverlayEventHandlerWithDownloadSupport
} from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { IStoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class PerformanceOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport<PerformanceCampaign> {

    protected _performanceAdUnit: PerformanceAdUnit;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        super.onOverlayDownload(parameters);
        this.sendClickEventToKafka(parameters);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.CLICK);
    }

    private sendClickEventToKafka(parameters: IVideoOverlayDownloadParameters) {
        const currentSession = this._campaign.getSession();
        const kafkaObject: { [key: string]: unknown } = {};
        kafkaObject.type = 'performance_video_overlay_cta_button_click';
        kafkaObject.auctionId = currentSession.getId();
        kafkaObject.rating = this._campaign.getRating();
        kafkaObject.number1 = parameters.videoDuration / 1000;
        kafkaObject.number2 = parameters.videoProgress / 1000;
        kafkaObject.number3 = parameters.videoProgress / parameters.videoDuration;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    public onOverlaySkip(position: number): void {
        if (this._placement.skipEndCardOnClose()) {
            super.onOverlayClose();
        } else {
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
