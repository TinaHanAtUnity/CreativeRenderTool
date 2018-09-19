import { Cache, ICacheEvent } from 'Core/Utilities/Cache';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { IObserver1, IObserver2, IObserver3 } from 'Core/Utilities/IObserver';

enum CacheDiagnosticEvent {
    STARTED,
    RESUMED,
    STOPPED,
    FINISHED,
    REDIRECTED,
    ERROR
}

export interface ICacheDiagnostics {
    creativeType: string;
    targetGameId: number;
    targetCampaignId: string;
}

export class CacheDiagnostics {

    private readonly _cache: Cache;
    private readonly _data: ICacheDiagnostics;

    private readonly _startObserver: IObserver2<ICacheEvent, number>;
    private readonly _redirectObserver: IObserver1<ICacheEvent>;
    private readonly _finishObserver: IObserver1<ICacheEvent>;
    private readonly _stopObserver: IObserver1<ICacheEvent>;
    private readonly _errorObserver: IObserver3<ICacheEvent, string, string>;

    constructor(cache: Cache, data: ICacheDiagnostics) {
        this._data = data;
        this._startObserver = cache.onStart.subscribe((event, size) => this.sendDiagnostic(size === 0 ? CacheDiagnosticEvent.STARTED : CacheDiagnosticEvent.RESUMED, event));
        this._redirectObserver = cache.onRedirect.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.REDIRECTED, event));
        this._finishObserver = cache.onFinish.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.FINISHED, event));
        this._stopObserver = cache.onStop.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.STOPPED, event));
        this._errorObserver = cache.onError.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.ERROR, event));
    }

    public stop() {
        this._cache.onStart.unsubscribe(this._startObserver);
        this._cache.onRedirect.unsubscribe(this._redirectObserver);
        this._cache.onFinish.unsubscribe(this._finishObserver);
        this._cache.onStop.unsubscribe(this._stopObserver);
        this._cache.onError.unsubscribe(this._errorObserver);
    }

    private sendDiagnostic(event: CacheDiagnosticEvent, cacheEvent: ICacheEvent) {
        const msg: any = {
            eventTimestamp: Date.now(),
            eventType: CacheDiagnosticEvent[event],
            creativeType: this._data.creativeType,
            size: cacheEvent.contentLength,
            downloadStartTimestamp: cacheEvent.contentLength,
            targetGameId: this._data.targetGameId,
            targetCampaignId: this._data.targetCampaignId
        };
        HttpKafka.sendEvent('ads.sdk2.events.creativedownload.json', KafkaCommonObjectType.ANONYMOUS, msg);
    }

}
