import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class PerformanceEndScreenQueryCTASquare extends PerformanceEndScreen {
    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        //Send an event to Kafka to inform that this was meant for the QueryCTA but couldn't be completed due to the square image
        //The UI currently does not respond well to the square image and it has been decided not to support it for the initial experiment
        const kafkaObject: IEndScreenQueryParameters = {
            type: 'ask_to_download',
            endcard: 'sqaure',
            auctionId: campaign.getSession().getId()
        };
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
