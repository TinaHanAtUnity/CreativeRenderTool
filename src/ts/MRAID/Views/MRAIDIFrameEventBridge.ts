import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export enum MRAIDEvents {
    ORIENTATION         = 'orientation',
    OPEN                = 'open',
    LOADED              = 'loaded',
    ANALYTICS_EVENT     = 'analyticsEvent',
    CLOSE               = 'close',
    STATE_CHANGE        = 'customMraidState',
    RESIZE_WEBVIEW      = 'resizeWebview'
}

export interface IMRAIDHandler {
    onSetOrientationProperties(allowOrientationChange: boolean, orientation: Orientation): void;
    onOpen(url: string): void;
    onLoaded(): void;
    onAnalyticsEvent(event: string, eventData: string): void;
    onClose(): void;
    onStateChange(customState: string): void;
    onResizeWebview(): void;
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
        this._handler.onSetOrientationProperties(properties.allowOrientationChange, forceOrientation);
    }

    private handleOpen(url: string) {
        this._handler.onOpen(url);
    }

    private handleLoaded() {
        this._handler.onLoaded();
    }

    private handleAnalyticsEvent(event: string, eventData: string) {
        this._handler.onAnalyticsEvent(event, eventData);
    }

    private handleClose() {
        this._handler.onClose();
    }

    private handleCustomState(customState: string) {
        this._handler.onStateChange(customState);
    }

    private postMessage(event: string, data?: any) {
        this._iframe.contentWindow!.postMessage({
            type: event,
            value: data
        }, '*');
    }
}