import { NativeBridge } from 'Native/NativeBridge';
import { NativeRequestBridge, RequestMethod, IRequestOptions } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { JaegerSpan, JaegerAnnotation } from './JaegerSpan';
import { Platform } from 'Constants/Platform';

export class JaegerManager {

    private static _openSpans: Map<string, JaegerSpan> = new Map();
    private static _closedSpans: Map<string, JaegerSpan> = new Map();

    private _nativeRequestBridge: NativeRequestBridge;
    private _isJaegerTracingEnabled: boolean = false;

    constructor(nativeRequestBridge: NativeRequestBridge) {
        this._nativeRequestBridge = nativeRequestBridge;
    }

    public setJaegerTracingEnabled(value: boolean) {
        this._isJaegerTracingEnabled = value;
    }

    public getTraceId(span: JaegerSpan): string {
        const jaegerFlags = this._isJaegerTracingEnabled ? '01' : '00';
        const jaegerTraceId: string = span.getTraceId() + ':' + span.getId() + ':' + span.getId() + ':' + jaegerFlags;
        return jaegerTraceId;
    }

    public addOpenSpan(span: JaegerSpan) {
        JaegerManager._openSpans.set(span.getId(), span);
    }

    public startSpan(name: string, serviceName: string, annotations: JaegerAnnotation[]): JaegerSpan {
        const span = new JaegerSpan(name, serviceName, annotations);
        JaegerManager._openSpans.set(span.getId(), span);
        return span;
    }

    public stopNetworkSpan(span: JaegerSpan, platform: Platform, statusCode: string) {
        span.stopNetwork(platform, statusCode);
        JaegerManager._closedSpans.set(span.getId(), span);
        JaegerManager._openSpans.delete(span.getId());
        this.flushClosedSpans();
    }

    public stopProcessSpan(span: JaegerSpan, platform: Platform, error?: string) {
        span.stopProcess(platform, error);
        JaegerManager._closedSpans.set(span.getId(), span);
        JaegerManager._openSpans.delete(span.getId());
        this.flushClosedSpans();
    }

    private flushClosedSpans() {
        if (JaegerManager._openSpans.size <= 0) {
            const spans: JaegerSpan[] = [];
            JaegerManager._closedSpans.forEach((value: JaegerSpan, key: string) => {
                spans.push(value);
            });
            JaegerManager._closedSpans.clear();
            if (spans.length > 0) { // only post if we have spans
                this.postToJaeger(spans);
            }
        }
    }

    private postToJaeger(spans: JaegerSpan[]) {
        if (this._isJaegerTracingEnabled === true) {
            const headers: Array<[string, string]> = [];
            const options: IRequestOptions = NativeRequestBridge.getDefaultRequestOptions();
            const url: string = 'http://10.1.83.159:9411/api/v2/spans'; // TODO point to real jaeger
            const data: string = JSON.stringify(spans);

            headers.push(['Content-Type', 'application/json']);

            this._nativeRequestBridge.invokeRequest({
                method: RequestMethod.POST,
                url: url,
                data: data,
                headers: headers,
                retryCount: 0,
                options: options
            });
        }
    }

}
