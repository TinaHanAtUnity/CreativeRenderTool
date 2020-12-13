export class MRAIDAdapterContainer {
    constructor(handler) {
        this._isConnected = false;
        this._handler = handler;
    }
    getHandler() {
        return this._handler;
    }
    connect(eventAdapter) {
        this._eventAdapter = eventAdapter;
        if (!this._isConnected) {
            this._eventAdapter.connect();
            this._isConnected = true;
        }
    }
    disconnect() {
        this._eventAdapter.disconnect();
        this._isConnected = false;
    }
    sendViewableEvent(viewable) {
        this._eventAdapter.sendViewableEvent(viewable);
    }
    sendDeviceOrientationEvent(event) {
        this._eventAdapter.sendDeviceOrientationEvent(event);
    }
    onBridgeSetOrientationProperties(allowOrientationChange, orientation) {
        this._handler.onBridgeSetOrientationProperties(allowOrientationChange, orientation);
    }
    onBridgeOpen(url) {
        this._handler.onBridgeOpen(url);
    }
    onBridgeLoad() {
        this._handler.onBridgeLoad();
    }
    onBridgeAnalyticsEvent(event, eventData) {
        this._handler.onBridgeAnalyticsEvent(event, eventData);
    }
    onBridgeClose() {
        this._handler.onBridgeClose();
    }
    onBridgeStateChange(customState) {
        this._handler.onBridgeStateChange(customState);
    }
    onBridgeResizeWebview() {
        this._handler.onBridgeResizeWebview();
    }
    onBridgeSendStats(totalTime, playTime, frameCount) {
        this._handler.onBridgeSendStats(totalTime, playTime, frameCount);
    }
    onBridgeAREvent(event) {
        this._handler.onBridgeAREvent(event);
    }
    onBridgeArReadyToShow(event) {
        this._handler.onBridgeArReadyToShow(event);
    }
    onBridgeDeviceOrientationSubscribe() {
        this._handler.onBridgeDeviceOrientationSubscribe();
    }
    onUseCustomClose(hidden) {
        this._handler.onUseCustomClose(hidden);
    }
    onBridgeArButtonHide(event) {
        this._handler.onBridgeArButtonHide(event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURBZGFwdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01SQUlEL0V2ZW50QnJpZGdlL01SQUlEQWRhcHRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLE9BQU8scUJBQXFCO0lBSzlCLFlBQVksT0FBc0I7UUFGMUIsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVNLFVBQVU7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVNLE9BQU8sQ0FBQyxZQUErQjtRQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUVNLFVBQVU7UUFDYixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxRQUFpQjtRQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTSwwQkFBMEIsQ0FBQyxLQUE2QjtRQUMzRCxJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFTSxnQ0FBZ0MsQ0FBQyxzQkFBK0IsRUFBRSxXQUF3QjtRQUM3RixJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFTSxZQUFZLENBQUMsR0FBVztRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sWUFBWTtRQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVNLHNCQUFzQixDQUFDLEtBQWEsRUFBRSxTQUFpQjtRQUMxRCxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU0sYUFBYTtRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxXQUFtQjtRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTSxxQkFBcUI7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsVUFBa0I7UUFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFTSxlQUFlLENBQUMsS0FBbUI7UUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLHFCQUFxQixDQUFDLEtBQW1CO1FBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLGtDQUFrQztRQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVNLGdCQUFnQixDQUFDLE1BQWU7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sb0JBQW9CLENBQUMsS0FBbUI7UUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBQ0oifQ==