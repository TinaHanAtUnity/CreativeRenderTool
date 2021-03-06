import { IMRAIDEventBridgeHandler, MRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';
import { ICoreApi } from 'Core/ICore';
import { ExternalMRAIDEndScreenMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export class MRAIDEventBridgeForIFrame extends MRAIDEventBridge {
    private _messageListener: (e: MessageEvent) => void;
    private _iframe: HTMLIFrameElement;

    public constructor(handler: IMRAIDEventBridgeHandler, core: ICoreApi, iframe: HTMLIFrameElement) {
        super(handler, core);

        this._iframe = iframe;
    }

    protected start(): void {
        this._messageListener = (event: MessageEvent) => this.onMessageEvent(event);
        window.addEventListener('message', this._messageListener);
    }

    private onMessageEvent(event: MessageEvent): void {
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
                SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.UnknownMRAIDEvent, { event: event.data.type });
        }
    }

    protected postMessage(event: string, data?: unknown): void {
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }

    public stop(): void {
        window.removeEventListener('message', this._messageListener);
    }
}
