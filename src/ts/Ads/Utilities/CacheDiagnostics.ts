import { Cache, ICallbackObject } from 'Core/Utilities/Cache';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

enum CacheDiagnosticEvent {
    STARTED,
    RESUMED,
    STOPPED,
    FINISHED,
    REDIRECTED,
    ERROR
}

export class CacheDiagnostics {

    constructor(cache: Cache) {
        cache.onStart.subscribe((callback, size) => this.sendDiagnostic(size === 0 ? CacheDiagnosticEvent.STARTED : CacheDiagnosticEvent.RESUMED, callback));
        cache.onFinish.subscribe((callback, redirect) => this.sendDiagnostic(redirect ? CacheDiagnosticEvent.REDIRECTED : CacheDiagnosticEvent.FINISHED, callback));
        cache.onStop.subscribe((callback) => this.sendDiagnostic(CacheDiagnosticEvent.STOPPED, callback));
        cache.onError.subscribe((callback) => this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback));
    }

    private sendDiagnostic(event: CacheDiagnosticEvent, callback: ICallbackObject) {
        const msg: any = {
            eventTimestamp: Date.now(),
            eventType: CacheDiagnosticEvent[event],
            creativeType: callback.diagnostics.creativeType,
            size: callback.contentLength,
            downloadStartTimestamp: callback.startTimestamp,
            targetGameId: callback.diagnostics.targetGameId,
            targetCampaignId: callback.diagnostics.targetCampaignId
        };
        HttpKafka.sendEvent('ads.sdk2.events.creativedownload.json', KafkaCommonObjectType.ANONYMOUS, msg);
    }

}
