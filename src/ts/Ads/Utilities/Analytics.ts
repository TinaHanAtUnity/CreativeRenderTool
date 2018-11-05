import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Utilities/Request';

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
