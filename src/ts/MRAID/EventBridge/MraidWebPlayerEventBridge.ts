import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IObserver1 } from 'Core/Utilities/IObserver';
import { AbstractMRAIDEventBridge, IMRAIDHandler, MRAIDEvents, IMRAIDOrientationProperties } from 'MRAID/EventBridge/AbstractMraidEventBridge';
import { ICoreApi } from 'Core/ICore';

export class MraidWebPlayerEventBridge extends AbstractMRAIDEventBridge {
    private _container: WebPlayerContainer | undefined;
    private _core: ICoreApi;
    private _webPlayerEventObserver: IObserver1<string>;

    constructor(core: ICoreApi, handler: IMRAIDHandler) {
        super(handler);
        this._core = core;
        this._mraidHandlers[MRAIDEvents.RESIZE_WEBVIEW] = () => this.handleResizeWebview();
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg: any) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg[0]);
        this._mraidHandlers[MRAIDEvents.OPEN] = (msg: any) => this.handleOpen(msg[0]);
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = (msg: any) => this.handleAnalyticsEvent(msg[0], msg[1]);
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = (msg: any) => this.handleCustomState(msg[0]);
    }

    public connect(container: WebPlayerContainer): void {
        this._container = container;
        this._webPlayerEventObserver = this._container.onWebPlayerEvent.subscribe((event) => this.onWebPlayerEvent(JSON.parse(event)));
    }

    public disconnect(): void {
        if (this._container) {
            this._container.onWebPlayerEvent.unsubscribe(this._webPlayerEventObserver);
        }
    }

    public sendViewableEvent(viewable: boolean) {
        this.sendEvent('viewable', [viewable]);
    }

    private handleResizeWebview() {
        this._handler.onBridgeResizeWebview();
    }

    private onWebPlayerEvent(args: any[]) {
        const eventType = args.shift();
        const params = args.shift();

        this._core.Sdk.logInfo(`mraid: event=${eventType}, data=${params}`);
        if (eventType in this._mraidHandlers) {
            const handler = this._mraidHandlers[eventType];
            handler(params);
        }
    }

    private sendEvent(event: string, parameters?: any[]): Promise<void> {
        const webPlayerParams: any[] = [event];
        if (parameters) {
            webPlayerParams.push(parameters);
        }

        if (this._container) {
            return this._container.sendEvent(webPlayerParams);
        }

        return Promise.resolve();
    }
}
