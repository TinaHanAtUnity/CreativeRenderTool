import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { ProgrammaticTrackingService, HackInitMetrics } from 'Ads/Utilities/ProgrammaticTrackingService';

export class SdkInitLatency {
    public static execute(clientInfo: ClientInfo, request: RequestManager): Promise<void> {
        const configUrl = clientInfo.getConfigUrl();
        const webViewUrl = clientInfo.getWebviewUrl();

        const timestampConfigUrl = performance.now();
        let timestampWebViewUrl = 0;
        return request.get(configUrl, [], {
            retries: 6,
            retryDelay: 5000,
            followRedirects: false,
            retryWithConnectionEvents: false,
            timeout: 30000
        }).then(() => {
            const time = performance.now() - timestampConfigUrl;
            ProgrammaticTrackingService.reportTimingEvent(HackInitMetrics.ConfigFetchTime, time);
        }).catch().then(() => {
            timestampWebViewUrl = performance.now();
            return request.get(webViewUrl, [], {
                retries: 6,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: false,
                timeout: 30000
            });
        }).then(() => {
            const time = performance.now() - timestampWebViewUrl;
            ProgrammaticTrackingService.reportTimingEvent(HackInitMetrics.WebViewFetchTime, time);
        });
    }
}
