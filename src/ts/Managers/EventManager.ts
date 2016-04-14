import { NativeBridge } from 'Native/NativeBridge';
import { Request, NativeResponse } from 'Utilities/Request';
import { StorageType } from 'Native/Api/Storage';

export class EventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._nativeBridge = nativeBridge;
        this._request = request;
    }

    public operativeEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads operative event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');

        let urlKey: string = this.getUrlKey(sessionId, eventId);
        let dataKey: string = this.getDataKey(sessionId, eventId);

        this._nativeBridge.Storage.set(StorageType.PRIVATE, urlKey, url);
        this._nativeBridge.Storage.set(StorageType.PRIVATE, dataKey, data);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);

        return this._request.post(url, data, [], 5, 5000).then(() => {
            return this._nativeBridge.Storage.delete(StorageType.PRIVATE, urlKey);
        }).then(() => {
            return this._nativeBridge.Storage.delete(StorageType.PRIVATE, dataKey);
        }).then(() => {
            return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public thirdPartyEvent(event: string, sessionId: string, url: string): Promise<NativeResponse> {
        this._nativeBridge.Sdk.logInfo('Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')');
        return this._request.get(url);
    }

    public diagnosticEvent(url: string, data: string): Promise<NativeResponse> {
        return this._request.post(url, data);
    }

    public sendUnsentSessions(): Promise<any[]> {
        return this.getUnsentSessions().then(sessions => {
            let promises = sessions.map(sessionId => {
                return this.getUnsentOperativeEvents(sessionId).then(events => {
                    return Promise.all(events.map(eventId => {
                        return this.resendEvent(sessionId, eventId);
                    }));
                });
            });
            return Promise.all(promises);
        });
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId();
    }

    private getUnsentSessions(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private getUnsentOperativeEvents(sessionId: string): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false);
    }

    private resendEvent(sessionId: string, eventId: string): Promise<void> {
        let urlKey: string = this.getUrlKey(sessionId, eventId);
        let dataKey: string = this.getDataKey(sessionId, eventId);

        return this.getStoredOperativeEvent(sessionId, eventId).then(([url, data]) => {
            this._nativeBridge.Sdk.logInfo('Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event + ' + eventId + ')');
            return this._request.post(url, data, [], 5, 5000);
        }).then(() => {
            return this._nativeBridge.Storage.delete(StorageType.PRIVATE, urlKey);
        }).then(() => {
            return this._nativeBridge.Storage.delete(StorageType.PRIVATE, dataKey);
        }).then(() => {
            return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    private getStoredOperativeEvent(sessionId: string, eventId: string): Promise<[string, string]> {
        return Promise.all([
            this._nativeBridge.Storage.get(StorageType.PRIVATE, this.getUrlKey(sessionId, eventId)),
            this._nativeBridge.Storage.get(StorageType.PRIVATE, this.getDataKey(sessionId, eventId))
        ]);
    }

    private getUrlKey(sessionId: string, eventId: string): string {
        return 'session.' + sessionId + '.operative.' + eventId + '.url';
    }

    private getDataKey(sessionId: string, eventId: string): string {
        return 'session.' + sessionId + '.operative.' + eventId + '.data';
    }
}
