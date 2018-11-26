
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ICoreApi } from 'Core/ICore';

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
    private _core: ICoreApi;
    private _handler: IMRAIDHandler;

    private _messageListener: (e: Event) => void;
    private _mraidHandlers: { [event: string]: (msg: { [key: string]: unknown }) => void };

    constructor(core: ICoreApi, handler: IMRAIDHandler) {
        this._core = core;
        this._handler = handler;

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._mraidHandlers = {};
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = msg => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg.properties);
        this._mraidHandlers[MRAIDEvents.OPEN] = msg => this.handleOpen(<string>msg.url);
        this._mraidHandlers[MRAIDEvents.LOADED] = msg => this.handleLoaded();
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = msg => this.handleAnalyticsEvent(<string>msg.event, <string>msg.eventData);
        this._mraidHandlers[MRAIDEvents.CLOSE] = msg => this.handleClose();
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = msg => this.handleCustomState(<string>msg.state);
        this._mraidHandlers[MRAIDEvents.SEND_STATS] = msg => this.handleSendStats(<number>msg.totalTime, <number>msg.playTime, <number>msg.frameCount);
        this._mraidHandlers[MRAIDEvents.AR] = msg => this.handleAr(<MessageEvent>msg);
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
        this._core.Sdk.logDebug(`mraid: event=${message.type}, data=${message}`);
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

    private postMessage(event: string, data?: unknown) {
        this._iframe.contentWindow!.postMessage({
            type: event,
            value: data
        }, '*');
    }
}
