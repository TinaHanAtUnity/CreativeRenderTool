import { INativeResponse } from 'Core/Managers/RequestManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class Diagnostics {
    public static trigger(type: string, error: {}): Promise<INativeResponse> {
        return Promise.resolve(<INativeResponse>{});
    }
}
