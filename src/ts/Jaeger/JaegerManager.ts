import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IJaegerSpan, JaegerSpan } from 'Jaeger/JaegerSpan';
import { Platform } from 'Constants/Platform';

export class JaegerManager {

    private static _openSpans: Map<string, IJaegerSpan> = new Map();
    private static _closedSpans: Map<string, IJaegerSpan> = new Map();

    private _request: Request;
    private _isJaegerTracingEnabled: boolean = false;

    constructor(request: Request) {
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
        JaegerManager._openSpans.set(span.id, span);
    }

    public startSpan(operation: string, parentId?: string, traceId?: string): JaegerSpan {
        const span = new JaegerSpan(operation, parentId, traceId);
        JaegerManager._openSpans.set(span.id, span);
        return span;
    }

    public stop(span: IJaegerSpan) {
        span.stop();
        JaegerManager._closedSpans.set(span.id, span);
        JaegerManager._openSpans.delete(span.id);
        this.flushClosedSpans();
    }

    private flushClosedSpans() {
        if (JaegerManager._openSpans.size <= 0) {
            const spans: IJaegerSpan[] = [];
            JaegerManager._closedSpans.forEach((value: IJaegerSpan, key: string) => {
                spans.push(value);
            });
            JaegerManager._closedSpans.clear();
            if (spans.length > 0) { // only post if we have spans
                this.postToJaeger(spans);
            }
        }
    }

    private postToJaeger(spans: IJaegerSpan[]) {
        if (this._isJaegerTracingEnabled === true) {
            const headers: Array<[string, string]> = [];
            const url: string = 'http://tracing-collector-stg.internal.unity3d.com/api/v2/spans';
            const data: string = JSON.stringify(spans);

            headers.push(['Content-Type', 'application/json']);

            this._request.post(url, data, headers);
        }
    }

}
