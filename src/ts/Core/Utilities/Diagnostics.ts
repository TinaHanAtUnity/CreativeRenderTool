import { INativeResponse } from 'Core/Managers/RequestManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ABGroup, DiagnosticsRampDown } from 'Core/Models/ABGroup';

export class Diagnostics {
    public static trigger(type: string, error: {}): Promise<INativeResponse> {
        if (Diagnostics.shouldNotSendEvents()) {
            return Promise.resolve(<INativeResponse>{});
        }

        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if (!error || typeof error !== 'object' || Array.isArray(error)) {
            error = {
                value: error
            };
        }

        const kafkaObject: { [key: string]: unknown } = {};
        kafkaObject.type = type;
        kafkaObject[type] = error;
        kafkaObject.timestamp = Date.now();

        return HttpKafka.sendEvent('ads.sdk2.diagnostics', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    public static setAbGroup(group: ABGroup) {
        Diagnostics._abGroup = group;
    }

    private static shouldNotSendEvents(): boolean {
        return Diagnostics._abGroup !== undefined && DiagnosticsRampDown.isValid(Diagnostics._abGroup) === false;
    }
    private static _abGroup: ABGroup | undefined;
}
