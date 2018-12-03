import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class ARMRAIDEventHandler extends MRAIDEventHandler implements IMRAIDViewHandler {

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: any): void {
        const kafkaObject: any = {};
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

        HttpKafka.sendEvent('ads.sdk2.events.ar.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
