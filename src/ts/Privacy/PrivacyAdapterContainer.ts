import { IPrivacyFrameEventAdapter, IPrivacyFrameHandler } from 'Privacy/PrivacyFrameEventAdapter';
import { IUserPrivacySettings } from 'Ads/Views/Consent/PrivacyView';

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

    public onPrivacyCompleted(userSettings: IUserPrivacySettings): void {
        this._handler.onPrivacyCompleted(userSettings);
    }

    public onPrivacyReady(): void {
        this._handler.onPrivacyReady();
    }
}
