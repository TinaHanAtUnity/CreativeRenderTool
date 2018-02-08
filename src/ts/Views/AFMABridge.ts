import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { NativeBridge } from 'Native/NativeBridge';

export enum AFMAEvents {
    OPEN_URL                = 'openUrl',
    CLOSE                   = 'close',
    FORCE_ORIENTATION       = 'forceOrientation',
    CLICK                   = 'click',
    REWARDED_VIDEO_START    = 'rewardedVideoStart',
    GRANT_REWARD            = 'grantReward',
    DISABLE_BACK_BUTTON     = 'disableBackButton',
    OPEN_STORE_OVERLAY      = 'openStoreOverlay',
    OPEN_IN_APP_STORE       = 'openInAppStore',
    FETCH_APP_STORE_OVERLAY = 'fetchAppStoreOverlay'
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
    start: IPoint;
    end: IPoint;
    diameter: number;
    pressure: number;
    counts: ITouchCounts;
}

export interface IAFMAMessage {
    type: string;
    event: string;
    data?: any;
}

export interface IAFMAHandler {
    onAFMAOpenURL(url: string): void;
    onAFMAClose(): void;
    onAFMAForceOrientation(orientation: ForceOrientation): void;
    onAFMAClick(url: string, touchInfo: ITouchInfo): void;
    onAFMARewardedVideoStart(): void;
    onAFMAGrantReward(): void;
    onAFMADisableBackButton(disabled: boolean): void;
    onAFMAOpenStoreOverlay(url: string): void;
    onAFMAOpenInAppStore(productId: string, url: string): void;
    onAFMAFetchAppStoreOverlay(productId: string): void;
}

export class AFMABridge {
    private _iframe: HTMLIFrameElement;
    private _nativeBridge: NativeBridge;
    private _handler: IAFMAHandler;
    private _messageListener: (e: Event) => void;
    private _afmaHandlers: { [eventName: string]: (msg: IAFMAMessage) => void };

    constructor(nativeBridge: NativeBridge, handler: IAFMAHandler) {
        this._nativeBridge = nativeBridge;
        this._handler = handler;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._afmaHandlers = {};
        this._afmaHandlers[AFMAEvents.OPEN_URL] = (msg) => this._handler.onAFMAOpenURL(msg.data.url);
        this._afmaHandlers[AFMAEvents.CLOSE] = () => this._handler.onAFMAClose();
        this._afmaHandlers[AFMAEvents.FORCE_ORIENTATION] = (msg) => this._handler.onAFMAForceOrientation(msg.data.orientation === 'portrait' ? ForceOrientation.PORTRAIT : ForceOrientation.LANDSCAPE);
        this._afmaHandlers[AFMAEvents.CLICK] = (msg) => this._handler.onAFMAClick(msg.data.url, msg.data.touch);
        this._afmaHandlers[AFMAEvents.REWARDED_VIDEO_START] = () => this._handler.onAFMARewardedVideoStart();
        this._afmaHandlers[AFMAEvents.GRANT_REWARD] = () => this._handler.onAFMAGrantReward();
        this._afmaHandlers[AFMAEvents.DISABLE_BACK_BUTTON] = (msg) => this._handler.onAFMADisableBackButton(msg.data.disabled);
        this._afmaHandlers[AFMAEvents.OPEN_STORE_OVERLAY] = (msg) => this._handler.onAFMAOpenStoreOverlay(msg.data.url);
        this._afmaHandlers[AFMAEvents.OPEN_IN_APP_STORE] = (msg) => this._handler.onAFMAOpenInAppStore(msg.data.productId, msg.data.url);
        this._afmaHandlers[AFMAEvents.FETCH_APP_STORE_OVERLAY] = (msg) => this._handler.onAFMAFetchAppStoreOverlay(msg.data.productId);
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

    private onMessage(e: MessageEvent) {
        const message = <IAFMAMessage>e.data;
        if (message.type === 'afma') {
            this._nativeBridge.Sdk.logDebug(`afma: event=${message.event}, data=${message.data}`);
            if (message.event in this._afmaHandlers) {
                const handler = this._afmaHandlers[message.event];
                handler(message);
            }
        }
    }

    private postMessage(event: string) {
        this._iframe.contentWindow.postMessage({
            type: 'afma',
            event: event
        }, '*');
    }
}
