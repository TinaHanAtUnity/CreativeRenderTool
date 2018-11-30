import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

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

export interface IMRAIDBridge {
    connect(): void;
    disconnect(): void;
    setHandler(handler: IMRAIDHandler): void;
    sendViewableEvent(viewable: boolean): void;
}

export type IMRAIDBridgeConnector = HTMLIFrameElement | WebPlayerContainer;

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

export abstract class AbstractMRAIDEventBridge implements IMRAIDBridge {
    protected _handler: IMRAIDHandler;
    protected _mraidHandlers: { [event: string]: (msg: any) => void };

    constructor(handler: IMRAIDHandler) {
        this._handler = handler;

        this._mraidHandlers = {};
        this._mraidHandlers[MRAIDEvents.LOADED] = () => this.handleLoaded();
        this._mraidHandlers[MRAIDEvents.CLOSE] = () => this.handleClose();
    }

    public setHandler(handler: IMRAIDHandler) {
        this._handler = handler;
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

    private handleLoaded() {
        this._handler.onBridgeLoad();
    }

    private handleClose() {
        this._handler.onBridgeClose();
    }
}
