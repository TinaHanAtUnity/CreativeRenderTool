import { ICoreApi } from 'Core/ICore';
import { IPrivacySettings } from 'Ads/Views/Privacy/PrivacyView';

export enum IFrameEvents {
    PRIVACY_READY = 'onPrivacyReady',
    PRIVACY_COMPLETED = 'onPrivacyCompleted',
    PRIVACY_EVENT = 'onPrivacyEvent'
}

export interface IPrivacyFrameEventAdapter {
    connect(): void;
    disconnect(): void;
}

export interface IPrivacyFrameHandler {
    onPrivacyCompleted(userSettings: IPrivacySettings): void;
    onPrivacyReady(): void;
    onPrivacyEvent(name: string, data: { [key: string]: unknown }): void;
}

export class PrivacyFrameEventAdapter implements IPrivacyFrameEventAdapter {
    private _iFrame: HTMLIFrameElement;
    private _core: ICoreApi;
    private _messageListener: (e: Event) => void;
    private _handler: IPrivacyFrameHandler;
    private _iFrameHandlers: { [event: string]: (msg: { [key: string]: unknown }) => void };

    constructor(core: ICoreApi, handler: IPrivacyFrameHandler, iframe: HTMLIFrameElement) {
        this._handler = handler;
        this._core = core;
        this._iFrame = iframe;

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._iFrameHandlers = {};
        this._iFrameHandlers[IFrameEvents.PRIVACY_COMPLETED] = (msg) => this.onPrivacyCompleted(<IPrivacySettings>msg.data);
        this._iFrameHandlers[IFrameEvents.PRIVACY_READY] = (msg) => this.onPrivacyReady();
        this._iFrameHandlers[IFrameEvents.PRIVACY_EVENT] = (msg) => this.onPrivacyEvent(<string>msg.name, <{ [key: string]: unknown }>msg.data);
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    private onMessage(e: MessageEvent) {
        const message = e.data;
        if (message.type in this._iFrameHandlers) {
            const handler = this._iFrameHandlers[message.type];
            handler(message);
        }
    }

    public postMessage(event: string, data?: unknown) {
        if (this._iFrame.contentWindow) {
            this._iFrame.contentWindow.postMessage({
                type: event,
                data: data
            }, '*');
        }
    }

    private onPrivacyCompleted(userSettings: IPrivacySettings): void {
        this._handler.onPrivacyCompleted(userSettings);
    }

    private onPrivacyReady(): void {
        this._handler.onPrivacyReady();
    }

    private onPrivacyEvent(name: string, data: { [key: string]: unknown }): void {
        this._handler.onPrivacyEvent(name, data);
    }
}
