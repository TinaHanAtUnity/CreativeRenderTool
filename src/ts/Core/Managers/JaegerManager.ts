import { IJaegerSpan, JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { RequestManager } from 'Core/Managers/RequestManager';

export class JaegerManager {

    private static _openSpans: { [jaegerId: string]: IJaegerSpan } = {};
    private static _closedSpans: { [jaegerId: string]: IJaegerSpan } = {};

    private _request: RequestManager;
    private _isJaegerTracingEnabled: boolean = false;

    constructor(request: RequestManager) {
        this._request = request;
    }

    public setJaegerTracingEnabled(value: boolean) {
        this._isJaegerTracingEnabled = value;
    }

    public isJaegerTracingEnabled(): boolean {
        return this._isJaegerTracingEnabled;
    }

    public getTraceId(span: IJaegerSpan): [string, string] {
        const jaegerFlags = this._isJaegerTracingEnabled ? '01' : '00';
        const parentId = span.parentId ? span.parentId : '0';
        const jaegerTraceId: string = span.traceId + ':' + span.id + ':' + parentId + ':' + jaegerFlags;
        return ['uber-trace-id', jaegerTraceId];
    }

    public addOpenSpan(span: IJaegerSpan) {
        JaegerManager._openSpans[span.id] = span;
    }

    public startSpan(operation: string, parentId?: string, traceId?: string): JaegerSpan {
        const span = new JaegerSpan(operation, parentId, traceId);
        JaegerManager._openSpans[span.id] = span;
        return span;
    }

    public stop(span: IJaegerSpan) {
        span.stop();
        JaegerManager._closedSpans[span.id] = span;
        delete JaegerManager._openSpans[span.id];
        this.flushClosedSpans();
    }

    private flushClosedSpans() {
        if (Object.keys(JaegerManager._openSpans).length <= 0) {
            const spans: IJaegerSpan[] = [];
            Object.keys(JaegerManager._closedSpans).forEach(key => {
                spans.push(JaegerManager._closedSpans[key]);
                delete JaegerManager._closedSpans[key];
            });

            if (spans.length > 0) { // only post if we have spans
                this.postToJaeger(spans);
            }
        }
    }

    private postToJaeger(spans: IJaegerSpan[]) {
        if (this._isJaegerTracingEnabled === true) {
            const headers: Array<[string, string]> = [];
            const url: string = 'https://tracing-collector-stg.internal.unity3d.com/api/v2/spans';
            const data: string = JSON.stringify(spans);

            headers.push(['Content-Type', 'application/json']);

            this._request.post(url, data, headers);
        }
    }

}
