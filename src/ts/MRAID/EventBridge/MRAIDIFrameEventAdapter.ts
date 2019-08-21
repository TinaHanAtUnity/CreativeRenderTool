import { ICoreApi } from 'Core/ICore';
import { MRAIDEventAdapter, IMRAIDOrientationProperties, MRAIDEvents, IMRAIDHandler } from 'MRAID/EventBridge/MRAIDEventAdapter';

export class MRAIDIFrameEventAdapter extends MRAIDEventAdapter {
    private _iframe: HTMLIFrameElement;
    private _core: ICoreApi;

    private _messageListener: (e: Event) => void;

    constructor(core: ICoreApi, handler: IMRAIDHandler, iframe: HTMLIFrameElement) {
        super(handler);
        this._core = core;
        this._iframe = iframe;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg.properties);
        this._mraidHandlers[MRAIDEvents.OPEN] = (msg) => this.handleOpen(<string>msg.url);
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = (msg) => this.handleAnalyticsEvent(<string>msg.event, <string>msg.eventData);
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = (msg) => this.handleCustomState(<string>msg.state);
        this._mraidHandlers[MRAIDEvents.SEND_STATS] = (msg) => this.handleSendStats(<number>msg.totalTime, <number>msg.playTime, <number>msg.frameCount);
        this._mraidHandlers[MRAIDEvents.AR] = (msg) => this.handleAr(<MessageEvent>msg);
        this._mraidHandlers[MRAIDEvents.AR_READY_SHOW] = (msg) => this.handleArReadyToShow(<MessageEvent>msg);
        this._mraidHandlers[MRAIDEvents.CONSOLE_LOG] = (msg) => this.handleConsoleLog(<MessageEvent>msg);
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public sendViewableEvent(viewable: boolean) {
        this.postMessage('viewable', viewable);
    }

    public sendDeviceOrientationEvent(event: DeviceOrientationEvent): void {
        this.postMessage('deviceorientation_unity_v1', {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
            absolute: event.absolute
        });
    }

    private onMessage(e: MessageEvent) {
        const message = e.data;
        this._core.Sdk.logDebug(`mraid: event=${message.type}, data=${message}`);
        if (message.type in this._mraidHandlers) {
            const handler = this._mraidHandlers[message.type];
            handler(message);
        }
    }

    private postMessage(event: string, data?: unknown) {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }

    private handleAr(event: MessageEvent) {
        this._handler.onBridgeAREvent(event);
    }

    private handleArReadyToShow(event: MessageEvent) {
        this._handler.onBridgeArReadyToShow(event);
    }

    private handleConsoleLog(event: MessageEvent) {
        this._core.Sdk.logDebug(event.data.functionName + ': ' + event.data.args);
    }
}
