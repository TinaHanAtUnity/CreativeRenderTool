import { ICoreApi } from 'Core/ICore';
import { AbstractMRAIDEventBridge, IMRAIDHandler, MRAIDEvents, IMRAIDOrientationProperties } from 'MRAID/EventBridge/AbstractMraidEventBridge';

export class MraidIFrameEventBridge extends AbstractMRAIDEventBridge {
    private _iframe: HTMLIFrameElement;
    private _core: ICoreApi;

    private _messageListener: (e: Event) => void;

    constructor(core: ICoreApi, handler: IMRAIDHandler, iframe: HTMLIFrameElement) {
        super(handler);
        this._core = core;
        this._iframe = iframe;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg: any) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg.properties);
        this._mraidHandlers[MRAIDEvents.OPEN] = (msg: any) => this.handleOpen(msg.url);
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = (msg: any) => this.handleAnalyticsEvent(msg.event, msg.eventData);
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = (msg: any) => this.handleCustomState(msg.state);
        this._mraidHandlers[MRAIDEvents.SEND_STATS] = (msg: any) => this.handleSendStats(msg.totalTime, msg.playTime, msg.frameCount);
        this._mraidHandlers[MRAIDEvents.AR] = (msg: any) => this.handleAr(msg);
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

    private onMessage(e: MessageEvent) {
        const message = e.data;
        this._core.Sdk.logDebug(`mraid: event=${message.type}, data=${message}`);
        if (message.type in this._mraidHandlers) {
            const handler = this._mraidHandlers[message.type];
            handler(message);
        }
    }

    private postMessage(event: string, data?: any) {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }
}
