import { INativeResponse } from 'Core/Managers/RequestManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ABGroup, DignosticsRampDown } from 'Core/Models/ABGroup';

export class Diagnostics {
    public static trigger(type: string, error: {}): Promise<INativeResponse> {
        if (Diagnostics._abGroup === undefined || DignosticsRampDown.isValid(Diagnostics._abGroup)) {
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
        return Promise.resolve(<INativeResponse>{});
    }

    public static setAbGroup(group: ABGroup) {
        Diagnostics._abGroup = group;
    }
    private static _abGroup: ABGroup | undefined;
}
