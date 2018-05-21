import { INativeResponse } from 'Utilities/Request';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';

export class Analytics {
    public static trigger(type: string, data: {}): Promise<INativeResponse> {
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!data || typeof data !== 'object' || Array.isArray(data)) {
            data = {
                value: data
            };
        }
        return HttpKafka.sendEvent('ads.sdk2.analytics', KafkaCommonObjectType.ANONYMOUS, data);
    }
}
