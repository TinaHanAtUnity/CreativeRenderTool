import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Managers/RequestManager';

export class LoadCalledCounter {

    public static report(gameId: string, placementId: string, country: string, organizationId: string | undefined): Promise<INativeResponse> {
        const kafkaObject: { [key: string]: string } = {
            gameId: gameId,
            placementId: placementId,
            country: country,
            organizationId: organizationId || '',
            ts: Date.now().toString()
        };

        return HttpKafka.sendEvent('ads.load.counting', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
