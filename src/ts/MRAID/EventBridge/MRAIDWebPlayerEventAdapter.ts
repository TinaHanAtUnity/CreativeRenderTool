import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IObserver1 } from 'Core/Utilities/IObserver';
import { MRAIDEventAdapter, IMRAIDOrientationProperties, MRAIDEvents, IMRAIDHandler } from 'MRAID/EventBridge/MRAIDEventAdapter';
import { ICoreApi } from 'Core/ICore';
import { SDKMetrics, MraidWebplayerMetric } from 'Ads/Utilities/SDKMetrics';

export class MRAIDWebPlayerEventAdapter extends MRAIDEventAdapter {
    private _container: WebPlayerContainer;
    private _core: ICoreApi;
    private _webPlayerEventObserver: IObserver1<string>;

    constructor(core: ICoreApi, handler: IMRAIDHandler, container: WebPlayerContainer) {
        super(handler);
        this._core = core;
        this._container = container;

        this._mraidHandlers[MRAIDEvents.RESIZE_WEBVIEW] = () => this.handleResizeWebview();
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg[0]);
        this._mraidHandlers[MRAIDEvents.OPEN] = (msg) => this.handleOpen(<string>msg[0]);
        this._mraidHandlers[MRAIDEvents.ANALYTICS_EVENT] = (msg) => this.handleAnalyticsEvent(<string>msg[0], <string>msg[1]);
        this._mraidHandlers[MRAIDEvents.STATE_CHANGE] = (msg) => this.handleCustomState(<string>msg[0]);
        this._mraidHandlers[MRAIDEvents.SEND_STATS] = (msg) => this.handleSendStats(<number>msg[0], <number>msg[1], <number>msg[2]);
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

    public sendDeviceOrientationEvent(event: DeviceOrientationEvent): void {
        this.sendEvent('deviceorientation_unity_v1', [event]);
    }

    private onWebPlayerEvent(args: unknown[]) {
        const eventType = <string>args.shift();
        const params = args.shift();

        this._core.Sdk.logDebug(`mraid: event=${eventType}, data=${params}`);

        if (eventType === MRAIDEvents.OPEN) {
            SDKMetrics.reportMetricEvent(MraidWebplayerMetric.MraidClickReceived);
        }

        if (eventType in this._mraidHandlers) {
            const handler = this._mraidHandlers[eventType];
            handler(<{ [key: string]: unknown }>params);
        }
    }

    private sendEvent(event: string, parameters?: unknown[]): Promise<void> {
        const webPlayerParams: unknown[] = [event];
        if (parameters) {
            webPlayerParams.push(parameters);
        }

        return this._container.sendEvent(webPlayerParams);
    }

    private handleResizeWebview() {
        this._handler.onBridgeResizeWebview();
    }
}
