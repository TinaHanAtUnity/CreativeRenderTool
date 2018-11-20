
import { ICoreApi } from 'Core/ICore';
import { AbstractMRAIDEventBridge, IMRAIDHandler } from 'MRAID/EventBridge/AbstractMraidEventBridge';

export class MraidIFrameEventBridge extends AbstractMRAIDEventBridge {
    private _iframe: HTMLIFrameElement | undefined;
    private _core: ICoreApi;

    private _messageListener: (e: Event) => void;

    constructor(core: ICoreApi, handler: IMRAIDHandler) {
        super(handler);
        this._core = core;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
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

    private postMessage(event: string, data?: any) {
        if (this._iframe && this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }
}
