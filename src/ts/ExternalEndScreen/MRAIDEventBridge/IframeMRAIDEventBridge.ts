import { IMRAIDEventBridgeHandler, MRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';
import { ICoreApi } from 'Core/ICore';

export class IframeMRAIDEventBridge extends MRAIDEventBridge {
    private _messageListener: (e: MessageEvent) => void;
    private _iframe: HTMLIFrameElement;

    public constructor(handler: IMRAIDEventBridgeHandler, core: ICoreApi, iframe: HTMLIFrameElement) {
        super(handler, core);

        this._iframe = iframe;
    }

    protected setupEventListener(): void {
        this._messageListener = (event: MessageEvent) => this.onMessageEvent(event);
        window.addEventListener('message', this._messageListener);
    }

    private onMessageEvent(event: MessageEvent) {
        switch (event.data.type) {
            case 'ready':
                this._handler.onReady();
                break;
            case 'close':
                this._handler.onClose();
                break;
            case 'open':
                this._handler.onOpen(event.data.url);
                break;
            case 'loaded':
                this._handler.onLoaded();
                break;
            default:
                this._core.Sdk.logInfo('Unhandled mraid event type: ' + event.data.type);
        }
    }

    protected postMessage(event: string, data?: unknown) {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }

    public close() {
        window.removeEventListener('message', this._messageListener);
    }
}
