import { IPrivacyFrameEventAdapter, IPrivacyFrameHandler } from "Privacy/PrivacyFrameEventAdapter";
import { IPrivacyPermissions } from "Ads/Views/Consent/PrivacyView";

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

    public onPrivacyCollected(userSettings: IPrivacyPermissions): void {
        this._handler.onPrivacyCollected(userSettings);
    }

    public onPrivacyLoaded(): void {
        this._handler.onPrivacyLoaded();
    }
}
