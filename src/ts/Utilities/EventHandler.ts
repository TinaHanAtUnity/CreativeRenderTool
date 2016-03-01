import { NativeBridge } from 'NativeBridge';
import { Request } from 'Utilities/Request';
import { StorageManager, StorageType } from 'Managers/StorageManager';

export class EventHandler {
    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _storageManager: StorageManager;

    constructor(nativeBridge: NativeBridge, request: Request, storageManager: StorageManager) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._storageManager = storageManager;
    }

    public operativeEvent(event: string, sessionId: string, url: string, data: any): void {
        this.getUniqueEventId().then(id => {
            this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads operative event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')']);

            data.uuid = id;

            let urlKey: string = 'session.' + sessionId + '.operative.' + id + '.url';
            let dataKey: string = 'session.' + sessionId + '.operative.' + id + '.data';

            this._storageManager.set(StorageType.PRIVATE, urlKey, url);
            this._storageManager.set(StorageType.PRIVATE, dataKey, data);
            this._storageManager.write(StorageType.PRIVATE);

            this._request.post(url, data).then(() => {
                this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads operative event: ' + event + ' event successfully sent!']);
                this._storageManager.delete(StorageType.PRIVATE, urlKey);
                this._storageManager.delete(StorageType.PRIVATE, dataKey);
                this._storageManager.write(StorageType.PRIVATE);
            });
        });
    }

    public thirdPartyEvent(event: string, sessionId: string, url: string): void {
        this._nativeBridge.invoke('Sdk', 'logInfo', ['Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')']);
        this._request.get(url);
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
            return id;
        });
    }
}