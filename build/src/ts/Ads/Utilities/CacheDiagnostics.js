import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
var CacheDiagnosticEvent;
(function (CacheDiagnosticEvent) {
    CacheDiagnosticEvent[CacheDiagnosticEvent["STARTED"] = 0] = "STARTED";
    CacheDiagnosticEvent[CacheDiagnosticEvent["RESUMED"] = 1] = "RESUMED";
    CacheDiagnosticEvent[CacheDiagnosticEvent["STOPPED"] = 2] = "STOPPED";
    CacheDiagnosticEvent[CacheDiagnosticEvent["FINISHED"] = 3] = "FINISHED";
    CacheDiagnosticEvent[CacheDiagnosticEvent["REDIRECTED"] = 4] = "REDIRECTED";
    CacheDiagnosticEvent[CacheDiagnosticEvent["ERROR"] = 5] = "ERROR";
})(CacheDiagnosticEvent || (CacheDiagnosticEvent = {}));
export class CacheDiagnostics {
    constructor(cache, data) {
        this._cache = cache;
        this._data = data;
        this._startObserver = cache.onStart.subscribe((event, size) => this.sendDiagnostic(size === 0 ? CacheDiagnosticEvent.STARTED : CacheDiagnosticEvent.RESUMED, event));
        this._redirectObserver = cache.onRedirect.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.REDIRECTED, event));
        this._finishObserver = cache.onFinish.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.FINISHED, event));
        this._stopObserver = cache.onStop.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.STOPPED, event));
        this._finishErrorObserver = cache.onFinishError.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.ERROR, event));
        this._errorObserver = cache.onError.subscribe((event) => this.sendDiagnostic(CacheDiagnosticEvent.ERROR, event));
    }
    stop() {
        this._cache.onStart.unsubscribe(this._startObserver);
        this._cache.onRedirect.unsubscribe(this._redirectObserver);
        this._cache.onFinish.unsubscribe(this._finishObserver);
        this._cache.onStop.unsubscribe(this._stopObserver);
        this._cache.onFinishError.unsubscribe(this._finishErrorObserver);
        this._cache.onError.unsubscribe(this._errorObserver);
    }
    sendDiagnostic(event, cacheEvent) {
        const msg = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVEaWFnbm9zdGljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL0NhY2hlRGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRzVFLElBQUssb0JBT0o7QUFQRCxXQUFLLG9CQUFvQjtJQUNyQixxRUFBTyxDQUFBO0lBQ1AscUVBQU8sQ0FBQTtJQUNQLHFFQUFPLENBQUE7SUFDUCx1RUFBUSxDQUFBO0lBQ1IsMkVBQVUsQ0FBQTtJQUNWLGlFQUFLLENBQUE7QUFDVCxDQUFDLEVBUEksb0JBQW9CLEtBQXBCLG9CQUFvQixRQU94QjtBQVFELE1BQU0sT0FBTyxnQkFBZ0I7SUFZekIsWUFBWSxLQUFtQixFQUFFLElBQXVCO1FBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckssSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzVILElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEgsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqSCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDN0gsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySCxDQUFDO0lBRU0sSUFBSTtRQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQTJCLEVBQUUsVUFBdUI7UUFDdkUsTUFBTSxHQUFHLEdBQVk7WUFDakIsY0FBYyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDMUIsU0FBUyxFQUFFLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUN0QyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZO1lBQ3JDLElBQUksRUFBRSxVQUFVLENBQUMsYUFBYTtZQUM5QixzQkFBc0IsRUFBRSxVQUFVLENBQUMsYUFBYTtZQUNoRCxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZO1lBQ3JDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1NBQ2hELENBQUM7UUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLHVDQUF1QyxFQUFFLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2RyxDQUFDO0NBRUoifQ==