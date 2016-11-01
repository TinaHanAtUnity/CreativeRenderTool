import { INativeResponse } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class Diagnostics {
    public static trigger(data: any): Promise<INativeResponse> {
        return HttpKafka.sendEvent(Diagnostics.DiagnosticsBaseUrl, 'diagnostics', data);
    }

    public static setTestBaseUrl(baseUrl: string) {
        Diagnostics.DiagnosticsBaseUrl = baseUrl + '/v1/events';
    }

    private static DiagnosticsBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';
}
