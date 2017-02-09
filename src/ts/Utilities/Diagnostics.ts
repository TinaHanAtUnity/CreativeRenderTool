import { INativeResponse } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class Diagnostics {
    public static trigger(type: string, error: {}): Promise<INativeResponse> {
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!error || typeof error !== 'object' || Array.isArray(error)) {
            error = {
                value: error
            };
        }
        return HttpKafka.sendEvent('diagnostics', {
            type: type,
            error: error
        });
    }
}
