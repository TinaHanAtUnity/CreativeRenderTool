import { INativeResponse } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class Analytics {
    public static trigger(data: any): Promise<INativeResponse> {
        return HttpKafka.sendEvent('analytics', data);
    }
}
