import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ICoreApi } from 'Core/ICore';
import { IIntentData } from 'Core/Native/Android/Intent';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export interface IOpenableIntentsRequest {
    id: string;
    intents: IIntentData[];
}

export interface IOpenableIntentsResponse {
    id: string;
    results: { [id: string]: boolean };
}

export enum AFMAEvents {
    OPEN_URL                = 'openUrl',
    CLOSE                   = 'close',
    FORCE_ORIENTATION       = 'forceOrientation',
    CLICK                   = 'click',
    VIDEO_START             = 'videoStart',
    GRANT_REWARD            = 'grantReward',
    DISABLE_BACK_BUTTON     = 'disableBackButton',
    OPEN_STORE_OVERLAY      = 'openStoreOverlay',
    OPEN_IN_APP_STORE       = 'openInAppStore',
    FETCH_APP_STORE_OVERLAY = 'fetchAppStoreOverlay',
    OPEN_INTENTS_REQUEST    = 'openableIntents',
    TRACKING                = 'tracking',
    GET_CLICK_SIGNAL        = 'getClickSignal',
    USER_SEEKED             = 'seeked'
}

export interface IPoint {
    x: number;
    y: number;
}

export interface ITouchCounts {
    up: number;
    down: number;
    move: number;
    cancel: number;
}

export interface ITouchInfo {
    start: IPoint | undefined;
    end: IPoint | undefined;
    diameter: number | undefined;
    pressure: number | undefined;
    duration: number | undefined;
    counts: ITouchCounts;
}

export interface IAFMAMessage {
    type: string;
    event: string;
    data: { [key: string]: unknown };
}

export interface IClickSignalResponse {
    encodedClickSignal: string;
    rvdt: number;
}

export interface IAFMAHandler {
    onAFMAOpenURL(url: string): void;
    onAFMAClose(): void;
    onAFMAForceOrientation(orientation: Orientation): void;
    onAFMAClick(url: string, touchInfo: ITouchInfo): void;
    OnAFMAVideoStart(): void;
    onAFMAGrantReward(): void;
    onAFMADisableBackButton(disabled: boolean): void;
    onAFMAOpenStoreOverlay(url: string): void;
    onAFMAOpenInAppStore(productId: string, url: string): void;
    onAFMAFetchAppStoreOverlay(productId: string): void;
    onAFMAResolveOpenableIntents(productId: IOpenableIntentsRequest): void;
    onAFMATrackingEvent(event: TrackingEvent, data?: unknown): void;
    onAFMAClickSignalRequest(touchInfo: ITouchInfo): void;
    onAFMAUserSeeked(): void;
}

export class AFMABridge {
    private _core: ICoreApi;
    private _iframe: HTMLIFrameElement;
    private _handler: IAFMAHandler;
    private _messageListener: (e: Event) => void;
    private _afmaHandlers: { [eventName: string]: (msg: IAFMAMessage) => void };

    constructor(core: ICoreApi, handler: IAFMAHandler) {
        this._core = core;
        this._handler = handler;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._afmaHandlers = {};
        this._afmaHandlers[AFMAEvents.OPEN_URL] = (msg) => this._handler.onAFMAOpenURL(<string>msg.data.url);
        this._afmaHandlers[AFMAEvents.CLOSE] = () => this._handler.onAFMAClose();
        this._afmaHandlers[AFMAEvents.FORCE_ORIENTATION] = (msg) => this._handler.onAFMAForceOrientation(msg.data.orientation === 'portrait' ? Orientation.PORTRAIT : Orientation.LANDSCAPE);
        this._afmaHandlers[AFMAEvents.CLICK] = (msg) => this._handler.onAFMAClick(<string>msg.data.url, <ITouchInfo>msg.data.touch);
        this._afmaHandlers[AFMAEvents.VIDEO_START] = () => this._handler.OnAFMAVideoStart();
        this._afmaHandlers[AFMAEvents.GRANT_REWARD] = () => this._handler.onAFMAGrantReward();
        this._afmaHandlers[AFMAEvents.DISABLE_BACK_BUTTON] = (msg) => this._handler.onAFMADisableBackButton(<boolean>msg.data.disabled);
        this._afmaHandlers[AFMAEvents.OPEN_STORE_OVERLAY] = (msg) => this._handler.onAFMAOpenStoreOverlay(<string>msg.data.url);
        this._afmaHandlers[AFMAEvents.OPEN_IN_APP_STORE] = (msg) => this._handler.onAFMAOpenInAppStore(<string>msg.data.productId, <string>msg.data.url);
        this._afmaHandlers[AFMAEvents.FETCH_APP_STORE_OVERLAY] = (msg) => this._handler.onAFMAFetchAppStoreOverlay(<string>msg.data.productId);
        this._afmaHandlers[AFMAEvents.OPEN_INTENTS_REQUEST] = (msg) => this._handler.onAFMAResolveOpenableIntents(<IOpenableIntentsRequest>msg.data);
        this._afmaHandlers[AFMAEvents.TRACKING] = (msg) => this._handler.onAFMATrackingEvent(<TrackingEvent>msg.data.event, msg.data.data);
        this._afmaHandlers[AFMAEvents.GET_CLICK_SIGNAL] = (msg) => this._handler.onAFMAClickSignalRequest(<ITouchInfo>msg.data);
        this._afmaHandlers[AFMAEvents.USER_SEEKED] = (msg) => this._handler.onAFMAUserSeeked();
    }

    public connect(iframe: HTMLIFrameElement) {
        this._iframe = iframe;
        window.addEventListener('message', this._messageListener);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public onBackPressed() {
        this.postMessage('back');
    }

    public sendOpenableIntentsResult(result: IOpenableIntentsResponse) {
        this.postMessage('openableIntentsResponse', result);
    }

    public sendClickSignalResponse(response: IClickSignalResponse) {
        this.postMessage('clickSignal', response);
    }

    public sendMuteChange(mute: boolean) {
        this.postMessage('muteChange', mute);
    }

    private onMessage(e: MessageEvent) {
        const message = <IAFMAMessage>e.data;
        if (message.type === 'afma') {
            this._core.Sdk.logInfo(`afma: event=${message.event}, data=${JSON.stringify(message.data)}`);
            if (message.event in this._afmaHandlers) {
                const handler = this._afmaHandlers[message.event];
                handler(message);
            }
        }
    }

    private postMessage(event: string, data?: unknown) {
        this._iframe.contentWindow!.postMessage({
            type: 'afma',
            event: event,
            data: data
        }, '*');
    }
}
