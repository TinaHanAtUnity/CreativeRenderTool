import { INativeResponse } from 'Core/Managers/RequestManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class Analytics {
    public static trigger(type: string, data: {}): Promise<INativeResponse> {
        let modifiedData = data;
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!modifiedData || typeof modifiedData !== 'object' || Array.isArray(modifiedData)) {
            modifiedData = {
                value: modifiedData
            };
        }
        return HttpKafka.sendEvent('ads.sdk2.analytics', KafkaCommonObjectType.ANONYMOUS, modifiedData);
    }
}
