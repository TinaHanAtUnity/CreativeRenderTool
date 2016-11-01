import { INativeResponse } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class Diagnostics {
    public static trigger(data: any): Promise<INativeResponse> {
        return HttpKafka.sendEvent('diagnostics', data);
    }
}
