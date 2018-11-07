
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

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

export class MraidIFrameEventBridge {
    private _iframe: HTMLIFrameElement;
    private _nativeBridge: NativeBridge;
    private _handler: IMRAIDHandler;

    private _messageListener: (e: Event) => void;
    private _mraidHandlers: { [event: string]: (msg: any) => void };

    constructor(nativeBridge: NativeBridge, handler: IMRAIDHandler) {
        this._nativeBridge = nativeBridge;
        this._handler = handler;

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
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

    public connect(iframe: HTMLIFrameElement) {
        this._iframe = iframe;
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public sendViewableEvent(viewable: boolean) {
        this.postMessage('viewable', viewable);
    }

    private onMessage(e: MessageEvent) {
        const message = e.data;
        this._nativeBridge.Sdk.logDebug(`mraid: event=${message.type}, data=${message}`);
        if (message.type in this._mraidHandlers) {
            const handler = this._mraidHandlers[message.type];
            handler(message);
        }
    }

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

    private postMessage(event: string, data?: any) {
        this._iframe.contentWindow!.postMessage({
            type: event,
            value: data
        }, '*');
    }
}
