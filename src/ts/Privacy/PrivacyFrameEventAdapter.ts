import { ICoreApi } from 'Core/ICore';
import { IUserPrivacySettings } from 'Ads/Views/Consent/PrivacyView';

export enum IFrameEvents {
    PRIVACY_READY = 'onPrivacyReady',
    PRIVACY_COMPLETED = 'onPrivacyCompleted'
}

export interface IPrivacyFrameEventAdapter {
    connect(): void;
    disconnect(): void;
}

export interface IPrivacyFrameHandler {
    onPrivacyCompleted(userSettings: IUserPrivacySettings): void;
    onPrivacyReady(): void;
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
        this._iFrameHandlers[IFrameEvents.PRIVACY_COMPLETED] = (msg) => this.onPrivacyCompleted(<IUserPrivacySettings>msg.data);
        this._iFrameHandlers[IFrameEvents.PRIVACY_READY] = (msg) => this.onPrivacyReady();
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    private onMessage(e: MessageEvent) {
        const message = e.data;
        this._core.Sdk.logDebug(`privacy-iframe: event=${message.type}, data=${message}`);
        if (message.type in this._iFrameHandlers) {
            const handler = this._iFrameHandlers[message.type];
            handler(message);
        }
    }

    private postMessage(event: string, data?: unknown) {
        console.log(`##PRIVACY: IPrivacyFrameEventAdapter postMessage: ${event}`);
        if (this._iFrame.contentWindow) {
            this._iFrame.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }

    private onPrivacyCompleted(userSettings: IUserPrivacySettings) {
        this._handler.onPrivacyCompleted(userSettings);
    }

    private onPrivacyReady() {
        this._handler.onPrivacyReady();
    }
}
