import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IObserver1 } from 'Core/Utilities/IObserver';
import { MRAIDEventAdapter, IMRAIDOrientationProperties } from 'MRAID/EventBridge/MRAIDEventAdapter';
import { ICoreApi } from 'Core/ICore';
import { IMRAIDHandler, MRAIDEvents } from 'MRAID/EventBridge/MRAIDAdapterContainer';

export class MRAIDWebPlayerEventAdapter extends MRAIDEventAdapter {
    private _container: WebPlayerContainer;
    private _core: ICoreApi;
    private _webPlayerEventObserver: IObserver1<string>;

    constructor(core: ICoreApi, handler: IMRAIDHandler, container: WebPlayerContainer) {
        super(handler);
        this._core = core;
        this._container = container;

        this._mraidHandlers[MRAIDEvents.RESIZE_WEBVIEW] = () => this.handleResizeWebview();
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg: any) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg[0]);
        this._mraidHandlers[MRAIDEvents.OPEN] = (msg: any) => this.handleOpen(msg[0]);
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = (msg: any) => this.handleAnalyticsEvent(msg[0], msg[1]);
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = (msg: any) => this.handleCustomState(msg[0]);
    }

    public connect(): void {
        this._webPlayerEventObserver = this._container.onWebPlayerEvent.subscribe((event) => this.onWebPlayerEvent(JSON.parse(event)));
    }

    public disconnect(): void {
        this._container.onWebPlayerEvent.unsubscribe(this._webPlayerEventObserver);
    }

    public sendViewableEvent(viewable: boolean) {
        this.sendEvent('viewable', [viewable]);
    }

    private onWebPlayerEvent(args: any[]) {
        const eventType = args.shift();
        const params = args.shift();

        this._core.Sdk.logDebug(`mraid: event=${eventType}, data=${params}`);
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

        return this._container.sendEvent(webPlayerParams);
    }
}
