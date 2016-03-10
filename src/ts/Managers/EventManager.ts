import { NativeBridge } from 'NativeBridge';
import { Request } from 'Utilities/Request';
import { StorageManager, StorageType } from 'Managers/StorageManager';

export class EventManager {
    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _storageManager: StorageManager;

    constructor(nativeBridge: NativeBridge, request: Request, storageManager: StorageManager) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._storageManager = storageManager;
    }

    public operativeEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<any[]> {
        this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads operative event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')']);

        let urlKey: string = this.getUrlKey(sessionId, eventId);
        let dataKey: string = this.getDataKey(sessionId, eventId);

        this._storageManager.set(StorageType.PRIVATE, urlKey, url);
        this._storageManager.set(StorageType.PRIVATE, dataKey, data);
        this._storageManager.write(StorageType.PRIVATE);

        return this._request.post(url, data, [], 5, 5000).then(() => {
            return this._storageManager.delete(StorageType.PRIVATE, urlKey);
        }).then(() => {
            return this._storageManager.delete(StorageType.PRIVATE, dataKey);
        }).then(() => {
            return this._storageManager.write(StorageType.PRIVATE);
        });
    }

    public thirdPartyEvent(event: string, sessionId: string, url: string): Promise<any[]> {
        this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')']);
        return this._request.get(url);
    }

    public diagnosticEvent(url: string, data: string): Promise<any[]> {
        return this._request.post(url, data);
    }

    public sendUnsentSessions(): Promise<any[]> {
        return this.getUnsentSessions().then((sessions: string[]) => {
            let promises = sessions.map(sessionId => {
                return this.getUnsentOperativeEvents(sessionId).then((events: string[]) => {
                    return Promise.all(events.map(eventId => {
                        return this.resendEvent(sessionId, eventId);
                    }));
                });
            });
            return Promise.all(promises);
        });
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
            return id;
        });
    }

    private getUnsentSessions(): Promise<any[]> {
        return this._storageManager.getKeys(StorageType.PRIVATE, 'session', false).then(data => {
            return data[0].toString().split(',');
        });
    }

    private getUnsentOperativeEvents(sessionId: string): Promise<any[]> {
        return this._storageManager.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false).then(data => {
            return data[0].toString().split(',');
        });
    }

    private resendEvent(sessionId: string, eventId: string): Promise<any[]> {
        let urlKey: string = this.getUrlKey(sessionId, eventId);
        let dataKey: string = this.getDataKey(sessionId, eventId);

        return this.getStoredOperativeEvent(sessionId, eventId).then(([url, data]) => {
            this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event + ' + eventId + ')']);
            return this._request.post(url, data, [], 5, 5000);
        }).then(() => {
            return this._storageManager.delete(StorageType.PRIVATE, urlKey);
        }).then(() => {
            return this._storageManager.delete(StorageType.PRIVATE, dataKey);
        }).then(() => {
            return this._storageManager.write(StorageType.PRIVATE);
        });
    }

    private getStoredOperativeEvent(sessionId: string, eventId: string): Promise<any[]> {
        return Promise.all([this._storageManager.get(StorageType.PRIVATE, this.getUrlKey(sessionId, eventId)), this._storageManager.get(StorageType.PRIVATE, this.getDataKey(sessionId, eventId))]);
    }

    private getUrlKey(sessionId: string, eventId: string): string {
        return 'session.' + sessionId + '.operative.' + eventId + '.url';
    }

    private getDataKey(sessionId: string, eventId: string): string {
        return 'session.' + sessionId + '.operative.' + eventId + '.data';
    }
}