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
        this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads operative event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')']);

        let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
        let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';

        this._storageManager.set(StorageType.PRIVATE, urlKey, url);
        this._storageManager.set(StorageType.PRIVATE, dataKey, data);
        this._storageManager.write(StorageType.PRIVATE);

        return this._request.post(url, data).then(() => {
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

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
            return id;
        });
    }
}