import { INativeResponse } from 'Core/Managers/RequestManager';
import { ABGroup } from 'Core/Models/ABGroup';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class LoadCalledCounter {

    public static report(gameId: string, placementId: string, country: string, count: number, abGroup: ABGroup, organizationId: string | undefined): Promise<INativeResponse> {
        const kafkaObject: { [key: string]: unknown } = {
            gameId: gameId,
            placementId: placementId,
            count: count,
            country: country,
            abGroup: abGroup,
            organizationId: organizationId || '',
            ts: Date.now()
        };

        return HttpKafka.sendEvent('ads.load.counting', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
