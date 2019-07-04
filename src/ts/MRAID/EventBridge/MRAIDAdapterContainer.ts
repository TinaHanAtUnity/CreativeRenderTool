import { MRAIDEventAdapter, IMRAIDHandler } from 'MRAID/EventBridge/MRAIDEventAdapter';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export class MRAIDAdapterContainer implements IMRAIDHandler {
    private _eventAdapter: MRAIDEventAdapter;
    private _handler: IMRAIDHandler;
    private _isConnected: boolean = false;

    constructor(handler: IMRAIDHandler) {
        this._handler = handler;
    }

    public getHandler() {
        return this._handler;
    }

    public connect(eventAdapter: MRAIDEventAdapter): void {
        this._eventAdapter = eventAdapter;
        if (!this._isConnected) {
            this._eventAdapter.connect();
            this._isConnected = true;
        }
    }

    public disconnect(): void {
        this._eventAdapter.disconnect();
        this._isConnected = false;
    }

    public sendViewableEvent(viewable: boolean) {
        this._eventAdapter.sendViewableEvent(viewable);
    }

    public sendDeviceOrientationEvent(event: DeviceOrientationEvent) {
        this._eventAdapter.sendDeviceOrientationEvent(event);
    }

    public onBridgeSetOrientationProperties(allowOrientationChange: boolean, orientation: Orientation): void {
        this._handler.onBridgeSetOrientationProperties(allowOrientationChange, orientation);
    }

    public onBridgeOpen(url: string): void {
        this._handler.onBridgeOpen(url);
    }

    public onBridgeLoad(): void {
        this._handler.onBridgeLoad();
    }

    public onBridgeAnalyticsEvent(event: string, eventData: string): void {
        this._handler.onBridgeAnalyticsEvent(event, eventData);
    }

    public onBridgeClose(): void {
        this._handler.onBridgeClose();
    }

    public onBridgeStateChange(customState: string): void {
        this._handler.onBridgeStateChange(customState);
    }

    public onBridgeResizeWebview(): void {
        this._handler.onBridgeResizeWebview();
    }

    public onBridgeSendStats(totalTime: number, playTime: number, frameCount: number): void {
        this._handler.onBridgeSendStats(totalTime, playTime, frameCount);
    }

    public onBridgeAREvent(event: MessageEvent): void {
        this._handler.onBridgeAREvent(event);
    }

    public onBridgeArReadyToShow(event: MessageEvent): void {
        this._handler.onBridgeArReadyToShow(event);
    }
}
