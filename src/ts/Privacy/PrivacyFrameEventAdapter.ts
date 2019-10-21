import { ICoreApi } from "Core/ICore";
import { IPrivacyPermissions } from "Ads/Views/Consent/PrivacyView";

export enum IFrameEvents {
    OPEN = 'open',
    LOADED = 'loaded',
    CLOSE = 'close',
    PRIVACY_COLLECTED = 'privacyCollected'
}

export interface IPrivacyFrameEventAdapter {
    connect(): void;
    disconnect(): void;
}

export interface IPrivacyFrameHandler {
    onPrivacyCollected(userSettings: IPrivacyPermissions): void;
    onPrivacyLoaded(): void;
}

export class PrivacyFrameEventAdapter implements IPrivacyFrameEventAdapter {
    private _iframe: HTMLIFrameElement;
    private _core: ICoreApi;

    private _messageListener: (e: Event) => void;

    private _handler: IPrivacyFrameHandler;
    private _iframeHandlers: { [event: string]: (msg: { [key: string]: unknown }) => void };

    constructor(core: ICoreApi, handler: IPrivacyFrameHandler, iframe: HTMLIFrameElement) {
        this._handler = handler;
        this._core = core;
        this._iframe = iframe;

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._iframeHandlers = {};

        this._iframeHandlers[IFrameEvents.PRIVACY_COLLECTED] = (msg) => this.onPrivacySettingsCollected(<IPrivacyPermissions>msg.data);
        this._iframeHandlers[IFrameEvents.LOADED] = (msg) => this.onPrivacyLoaded();
        //TODO: other events
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
        if (message.type in this._iframeHandlers) {
            const handler = this._iframeHandlers[message.type];
            handler(message);
        }
    }

    private postMessage(event: string, data?: unknown) {
        console.log(`##PRIVACY: IPrivacyFrameEventAdapter postMessage: ${event}`);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, "*");
        }
    }

    private onPrivacySettingsCollected(userSettings: IPrivacyPermissions) {
        this._handler.onPrivacyCollected(userSettings);
    }

    private onPrivacyLoaded() {
        this._handler.onPrivacyLoaded();
    }
}
