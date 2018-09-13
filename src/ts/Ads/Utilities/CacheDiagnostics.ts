import { Cache, ICallbackObject } from 'Core/Utilities/Cache';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { IObserver2, IObserver1, IObserver3 } from 'Core/Utilities/IObserver';

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

    private readonly _startObserver: IObserver2<ICallbackObject, number>;
    private readonly _finishObserver: IObserver2<ICallbackObject, boolean>;
    private readonly _stopObserver: IObserver1<ICallbackObject>;
    private readonly _errorObserver: IObserver3<ICallbackObject, string, string>;

    constructor(cache: Cache, data: ICacheDiagnostics) {
        this._data = data;
        this._startObserver = cache.onStart.subscribe((callback, size) => this.sendDiagnostic(size === 0 ? CacheDiagnosticEvent.STARTED : CacheDiagnosticEvent.RESUMED, callback));
        this._finishObserver = cache.onFinish.subscribe((callback, redirect) => this.sendDiagnostic(redirect ? CacheDiagnosticEvent.REDIRECTED : CacheDiagnosticEvent.FINISHED, callback));
        this._stopObserver = cache.onStop.subscribe((callback) => this.sendDiagnostic(CacheDiagnosticEvent.STOPPED, callback));
        this._errorObserver = cache.onError.subscribe((callback) => this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback));
    }

    public stop() {
        this._cache.onStart.unsubscribe(this._startObserver);
        this._cache.onFinish.unsubscribe(this._finishObserver);
        this._cache.onStop.unsubscribe(this._stopObserver);
        this._cache.onError.unsubscribe(this._errorObserver);
    }

    private sendDiagnostic(event: CacheDiagnosticEvent, callback: ICallbackObject) {
        const msg: any = {
            eventTimestamp: Date.now(),
            eventType: CacheDiagnosticEvent[event],
            creativeType: this._data.creativeType,
            size: callback.contentLength,
            downloadStartTimestamp: callback.startTimestamp,
            targetGameId: this._data.targetGameId,
            targetCampaignId: this._data.targetCampaignId
        };
        HttpKafka.sendEvent('ads.sdk2.events.creativedownload.json', KafkaCommonObjectType.ANONYMOUS, msg);
    }

}
