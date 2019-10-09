import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export interface IMRAIDOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: string;
}

export interface IMRAIDAdapter {
    connect(): void;
    disconnect(): void;
    sendViewableEvent(viewable: boolean): void;
}

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
    onBridgeArReadyToShow(event: MessageEvent): void;
    onBridgeDeviceOrientationSubscribe(): void;
    // TODO: should this be named onBridgeUseCustomClose?
    onUseCustomClose(hideClose: boolean): void;
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
    USE_CUSTOM_CLOSE    = 'useCustomClose',
    STATE_CHANGE        = 'customMraidState',
    RESIZE_WEBVIEW      = 'resizeWebview',
    SEND_STATS          = 'sendStats',
    AR                  = 'ar',
    AR_READY_SHOW       = 'arReadyShow',
    CONSOLE_LOG         = 'consoleLog',
    DEVORIENTATION_SUB  = 'deviceorientationSubscribe'
}

export abstract class MRAIDEventAdapter implements IMRAIDAdapter {
    protected _handler: IMRAIDHandler;
    protected _mraidHandlers: { [event: string]: (msg: { [key: string]: unknown }) => void };

    constructor(handler: IMRAIDHandler) {
        this._handler = handler;

        this._mraidHandlers = {};

        this._mraidHandlers[MRAIDEvents.LOADED] = () => this.handleLoaded();
        this._mraidHandlers[MRAIDEvents.CLOSE] = () => this.handleClose();
        this._mraidHandlers[MRAIDEvents.DEVORIENTATION_SUB] = () => this.handleSubscribeDeviceOrientation();
        this._mraidHandlers[MRAIDEvents.USE_CUSTOM_CLOSE] = (msg) => this.handleUseCustomClose(<boolean>msg['hidden']);
    }

    public abstract connect(): void;

    public abstract disconnect(): void;

    public abstract sendViewableEvent(viewable: boolean): void;

    public abstract sendDeviceOrientationEvent(event: DeviceOrientationEvent): void;

    protected handleSetOrientationProperties(properties: IMRAIDOrientationProperties) {
        let forceOrientation = Orientation.NONE;
        if (properties.forceOrientation) {
            switch (properties.forceOrientation) {
            case 'landscape':
                forceOrientation = Orientation.LANDSCAPE;
                break;
            case 'portrait':
                forceOrientation = Orientation.PORTRAIT;
                break;
            case 'none':
                forceOrientation = Orientation.NONE;
                break;
            default:
            }
        }
        this._handler.onBridgeSetOrientationProperties(properties.allowOrientationChange, forceOrientation);
    }

    protected handleOpen(url: string) {
        this._handler.onBridgeOpen(url);
    }

    protected handleAnalyticsEvent(event: string, eventData: string) {
        this._handler.onBridgeAnalyticsEvent(event, eventData);
    }

    protected handleCustomState(customState: string) {
        this._handler.onBridgeStateChange(customState);
    }

    protected handleLoaded() {
        this._handler.onBridgeLoad();
    }

    protected handleClose() {
        this._handler.onBridgeClose();
    }

    protected handleUseCustomClose(hidden: boolean) {
        // TODO: remove logs.
        console.log('|-o-| MRAIDEventAdapter.handleUseCustomClose(hidden='+ hidden + ')');
        this._handler.onUseCustomClose(hidden);
    }

    protected handleSendStats(totalTime: number, playTime: number, frameCount: number) {
        this._handler.onBridgeSendStats(totalTime, playTime, frameCount);
    }

    protected handleSubscribeDeviceOrientation() {
        this._handler.onBridgeDeviceOrientationSubscribe();
    }
}
