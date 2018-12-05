import { IMRAIDHandler, MRAIDEvents } from 'MRAID/EventBridge/MRAIDAdapterContainer';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export interface IExpandProperties {
    width: number;
    height: number;
    useCustomClose: boolean;
    isModal: boolean;
}

export interface IMRAIDDiagnostic {
    type: string;
    message: string;
}

export interface IMRAIDOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: string;
}

export interface IMRAIDAdapter {
    connect(): void;
    disconnect(): void;
    sendViewableEvent(viewable: boolean): void;
}

export abstract class MRAIDEventAdapter implements IMRAIDAdapter {
    protected _handler: IMRAIDHandler;
    protected _mraidHandlers: { [event: string]: (msg: any) => void };

    constructor(handler: IMRAIDHandler) {
        this._handler = handler;

        this._mraidHandlers = {};

        this._mraidHandlers[MRAIDEvents.LOADED] = () => this.handleLoaded();
        this._mraidHandlers[MRAIDEvents.CLOSE] = () => this.handleClose();
    }

    public abstract connect(): void;

    public abstract disconnect(): void;

    public abstract sendViewableEvent(viewable: boolean): void;

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

    protected handleSendStats(totalTime: number, playTime: number, frameCount: number) {
        this._handler.onBridgeSendStats(totalTime, playTime, frameCount);
    }

    protected handleAr(event: MessageEvent) {
        this._handler.onBridgeAREvent(event);
    }

    protected handleResizeWebview() {
        this._handler.onBridgeResizeWebview();
    }

    protected handleLoaded() {
        this._handler.onBridgeLoad();
    }

    protected handleClose() {
        this._handler.onBridgeClose();
    }
}
