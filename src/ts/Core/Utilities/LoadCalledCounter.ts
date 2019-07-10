import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Managers/RequestManager';

export class LoadCalledCounter {
    public static report(gameId: string, placementId: string): Promise<INativeResponse> {

        const kafkaObject: { [key: string]: string } = {
            gameId: gameId,
            placementId: placementId
        };

        return HttpKafka.sendEvent('ads.load.counting', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
