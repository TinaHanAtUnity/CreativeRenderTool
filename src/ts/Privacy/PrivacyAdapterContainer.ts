import { IPrivacyFrameEventAdapter, IPrivacyFrameHandler } from 'Privacy/PrivacyFrameEventAdapter';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';

export class PrivacyAdapterContainer implements IPrivacyFrameHandler {
    private _eventAdapter: IPrivacyFrameEventAdapter;
    private _isConnected = false;
    private _handler: IPrivacyFrameHandler;

    constructor(handler: IPrivacyFrameHandler) {
        this._handler = handler;
    }

    public connect(eventAdapter: IPrivacyFrameEventAdapter): void {
        this._eventAdapter = eventAdapter;
        if (!this._isConnected) {
            this._eventAdapter.connect();
            this._isConnected = true;
        }
    }

    public disconnect(): void {
        this._eventAdapter.disconnect();
        this._isConnected = false;
    }

    public onPrivacyCompleted(userSettings: IPrivacySettings): void {
        this._handler.onPrivacyCompleted(userSettings);
    }

    public onPrivacyReady(): void {
        this._handler.onPrivacyReady();
    }

    public onPrivacyOpenUrl(url: string): void {
        this._handler.onPrivacyOpenUrl(url);
    }

    public onPrivacyEvent(name: string, data: { [key: string]: unknown }): void {
        this._handler.onPrivacyEvent(name, data);
    }
}
