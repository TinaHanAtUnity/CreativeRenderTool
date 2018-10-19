import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Utilities/Request';

export class Analytics {
    public static trigger(type: string, data: {}): Promise<INativeResponse> {
        let _data = data;
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!_data || typeof _data !== 'object' || Array.isArray(_data)) {
            _data = {
                value: _data
            };
        }
        return HttpKafka.sendEvent('ads.sdk2.analytics', KafkaCommonObjectType.ANONYMOUS, _data);
    }
}
