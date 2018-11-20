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
    connect(connector: HTMLIFrameElement | WebPlayerContainer): void;
    disconnect(): void;
    setHandler(handler: IMRAIDHandler): void;
    sendViewableEvent(viewable: boolean): void;
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

export abstract class AbstractMRAIDEventBridge implements IMRAIDBridge {
    protected _handler: IMRAIDHandler;
    protected _mraidHandlers: { [event: string]: (msg: any) => void };

    constructor(handler: IMRAIDHandler) {
        this._handler = handler;

        this._mraidHandlers = {};
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg: any) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg.properties);
        this._mraidHandlers[MRAIDEvents.OPEN] = (msg: any) => this.handleOpen(msg.url);
        this._mraidHandlers[MRAIDEvents.LOADED] = (msg: any) => this.handleLoaded();
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = (msg: any) => this.handleAnalyticsEvent(msg.event, msg.eventData);
        this._mraidHandlers[MRAIDEvents.CLOSE] = (msg: any) => this.handleClose();
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = (msg: any) => this.handleCustomState(msg.state);
        this._mraidHandlers[MRAIDEvents.SEND_STATS] = (msg: any) => this.handleSendStats(msg.totalTime, msg.playTime, msg.frameCount);
        this._mraidHandlers[MRAIDEvents.AR] = (msg: any) => this.handleAr(msg);
    }

    public setHandler(handler: IMRAIDHandler) {
        this._handler = handler;
    }

    public abstract connect(connector: HTMLIFrameElement | WebPlayerContainer): void;

    public abstract disconnect(): void;

    public abstract sendViewableEvent(viewable: boolean): void;

    private handleSetOrientationProperties(properties: IMRAIDOrientationProperties) {
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

    private handleOpen(url: string) {
        this._handler.onBridgeOpen(url);
    }

    private handleLoaded() {
        this._handler.onBridgeLoad();
    }

    private handleAnalyticsEvent(event: string, eventData: string) {
        this._handler.onBridgeAnalyticsEvent(event, eventData);
    }

    private handleClose() {
        this._handler.onBridgeClose();
    }

    private handleCustomState(customState: string) {
        this._handler.onBridgeStateChange(customState);
    }

    private handleSendStats(totalTime: number, playTime: number, frameCount: number) {
        this._handler.onBridgeSendStats(totalTime, playTime, frameCount);
    }

    private handleAr(event: MessageEvent) {
        this._handler.onBridgeAREvent(event);
    }
}
