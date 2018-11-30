import { AbstractMRAIDEventBridge } from 'MRAID/EventBridge/AbstractMraidEventBridge';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export interface IMRAIDHandler {
    onBridgeSetOrientationProperties(allowOrientationChange: boolean, orientation: Orientation): void;
    onBridgeOpen(url: string): void;
    onBridgeLoad(): void;
    onBridgeAnalyticsEvent(event: string, eventData: string): void;
    onBridgeClose(): void;
    onBridgeStateChange(customState: string): void;
    onBridgeResizeWebview(): void;
    onBridgeSendStats(totalTime: number, playTime: number, frameCount: number): void;
    onBridgeAREvent(event: MessageEvent): void;
}

export interface IMRAIDOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: string;
}

export enum MRAIDEvents {
    ORIENTATION         = 'orientation',
    OPEN                = 'open',
    LOADED              = 'loaded',
    ANALYTICS_EVENT     = 'analyticsEvent',
    CLOSE               = 'close',
    STATE_CHANGE        = 'customMraidState',
    RESIZE_WEBVIEW      = 'resizeWebview',
    SEND_STATS          = 'sendStats',
    AR                  = 'ar'
}

export class MRAIDBridgeContainer implements IMRAIDHandler {
    private _eventBridge: AbstractMRAIDEventBridge;
    private _handler: IMRAIDHandler;

    constructor(handler: IMRAIDHandler) {
        this._handler = handler;
    }

    public connect(eventBridge: AbstractMRAIDEventBridge): void {
        this._eventBridge = eventBridge;
        this._eventBridge.connect();
    }

    public disconnect(): void {
        this._eventBridge.connect();
    }

    public sendViewableEvent(viewable: boolean) {
        this._eventBridge.sendViewableEvent(viewable);
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
}
