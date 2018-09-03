import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';

export class PlayableEventHandler extends MRAIDEventHandler implements IMRAIDViewHandler {

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

        HttpKafka.sendEvent('ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
