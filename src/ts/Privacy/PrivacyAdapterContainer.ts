import { IPrivacyFrameEventAdapter, IPrivacyFrameHandler } from 'Privacy/PrivacyFrameEventAdapter';
import { IPrivacyCompletedParams, IPrivacyFetchUrlParams } from 'Privacy/IPrivacySettings';

export class PrivacyAdapterContainer implements IPrivacyFrameHandler {
    private _eventAdapter: IPrivacyFrameEventAdapter;
    private _isConnected = false;
    private _handler: IPrivacyFrameHandler;

    constructor(handler: IPrivacyFrameHandler) {
        this._handler = handler;
    }

    public connect(eventAdapter: IPrivacyFrameEventAdapter): void {
        if (this._isConnected) {
            throw new Error('Trying to connect even though already connected. Disconnect should be called first.');
        }

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

    public onPrivacyCompleted(params: IPrivacyCompletedParams): void {
        this._handler.onPrivacyCompleted(params);
    }

    public onPrivacyReady(): void {
        this._handler.onPrivacyReady();
    }

    public onPrivacyOpenUrl(url: string): void {
        this._handler.onPrivacyOpenUrl(url);
    }

    public onPrivacyMetric(data: { [key: string]: unknown }): void {
        this._handler.onPrivacyMetric(data);
    }

    public onPrivacyFetchUrl(data: IPrivacyFetchUrlParams): void {
        this._handler.onPrivacyFetchUrl(data);
    }
}
