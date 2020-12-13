import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
export class JaegerManager {
    constructor(request) {
        this._isJaegerTracingEnabled = false;
        this._request = request;
    }
    setJaegerTracingEnabled(value) {
        this._isJaegerTracingEnabled = value;
    }
    isJaegerTracingEnabled() {
        return this._isJaegerTracingEnabled;
    }
    getTraceId(span) {
        const jaegerFlags = this.isJaegerTracingEnabled() ? '01' : '00';
        const parentId = span.parentId ? span.parentId : '0';
        const jaegerTraceId = span.traceId + ':' + span.id + ':' + parentId + ':' + jaegerFlags;
        return ['uber-trace-id', jaegerTraceId];
    }
    addOpenSpan(span) {
        JaegerManager._openSpans[span.id] = span;
    }
    startSpan(operation, parentId, traceId) {
        const span = new JaegerSpan(operation, parentId, traceId);
        JaegerManager._openSpans[span.id] = span;
        return span;
    }
    stop(span) {
        span.stop();
        JaegerManager._closedSpans[span.id] = span;
        delete JaegerManager._openSpans[span.id];
        this.flushClosedSpans();
    }
    flushClosedSpans() {
        if (Object.keys(JaegerManager._openSpans).length <= 0) {
            const spans = [];
            Object.keys(JaegerManager._closedSpans).forEach(key => {
                spans.push(JaegerManager._closedSpans[key]);
                delete JaegerManager._closedSpans[key];
            });
            if (spans.length > 0) { // only post if we have spans
                this.postToJaeger(spans);
            }
        }
    }
    postToJaeger(spans) {
        if (this.isJaegerTracingEnabled()) {
            const headers = [];
            // staging: https://traces-stg.unityads.unity3d.com/api/v2/spans
            const url = 'https://traces.unityads.unity3d.com/api/v2/spans';
            const data = JSON.stringify(spans);
            headers.push(['Content-Type', 'application/json']);
            this._request.post(url, data, headers);
        }
    }
}
JaegerManager._openSpans = {};
JaegerManager._closedSpans = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL01hbmFnZXJzL0phZWdlck1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFlLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBR2pFLE1BQU0sT0FBTyxhQUFhO0lBUXRCLFlBQVksT0FBdUI7UUFGM0IsNEJBQXVCLEdBQVksS0FBSyxDQUFDO1FBRzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxLQUFjO1FBQ3pDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUVNLHNCQUFzQjtRQUN6QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztJQUN4QyxDQUFDO0lBRU0sVUFBVSxDQUFDLElBQWlCO1FBQy9CLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDckQsTUFBTSxhQUFhLEdBQVcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUM7UUFDaEcsT0FBTyxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sV0FBVyxDQUFDLElBQWlCO1FBQ2hDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRU0sU0FBUyxDQUFDLFNBQWlCLEVBQUUsUUFBaUIsRUFBRSxPQUFnQjtRQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFELGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sSUFBSSxDQUFDLElBQWlCO1FBQ3pCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMzQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFTyxnQkFBZ0I7UUFDcEIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ25ELE1BQU0sS0FBSyxHQUFrQixFQUFFLENBQUM7WUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLDZCQUE2QjtnQkFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QjtTQUNKO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxLQUFvQjtRQUNyQyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFO1lBQy9CLE1BQU0sT0FBTyxHQUF1QixFQUFFLENBQUM7WUFDdkMsZ0VBQWdFO1lBQ2hFLE1BQU0sR0FBRyxHQUFXLGtEQUFrRCxDQUFDO1lBQ3ZFLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMxQztJQUNMLENBQUM7O0FBbkVjLHdCQUFVLEdBQXdDLEVBQUUsQ0FBQztBQUNyRCwwQkFBWSxHQUF3QyxFQUFFLENBQUMifQ==