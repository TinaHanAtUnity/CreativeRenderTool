import { INativeResponse } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class Analytics {
    public static trigger(data: any): Promise<INativeResponse> {
        return HttpKafka.sendEvent(Analytics.AnalyticsBaseUrl, 'diagnostics', data);
    }

    public static setTestBaseUrl(baseUrl: string) {
        Analytics.AnalyticsBaseUrl = baseUrl + '/v1/events';
    }

    private static AnalyticsBaseUrl: string = 'TODO';
}
