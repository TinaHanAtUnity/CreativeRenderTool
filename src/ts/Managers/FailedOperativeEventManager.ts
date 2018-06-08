import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';

export class FailedOperativeEventManager {

    protected _sessionId: string;
    protected _eventId: string | undefined;

    constructor(sessionId: string, eventId: string) {
        this._sessionId = sessionId;
        this._eventId = eventId;
    }

    public getEventStorageKey(): string {
        return this.getEventsStorageKey() + '.' + this._eventId;
    }

    public getEventsStorageKey(): string {
        return SessionManager.getSessionKey(this._sessionId) + '.operative';
    }

    public storeFailedEvent(nativeBridge: NativeBridge, data: { [key: string]: any }): Promise<void> {
        nativeBridge.Storage.set(StorageType.PRIVATE, this.getEventStorageKey(), data);
        nativeBridge.Storage.write(StorageType.PRIVATE);
        return Promise.resolve();
    }

    public deleteFailedEvent(nativeBridge: NativeBridge): Promise<void> {
        return Promise.all([
            nativeBridge.Storage.delete(StorageType.PRIVATE, this.getEventStorageKey()),
            nativeBridge.Storage.write(StorageType.PRIVATE)
        ]).then(() => {
            return Promise.resolve();
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    public sendFailedEvent(nativeBridge: NativeBridge, request: Request): Promise<void> {
        return nativeBridge.Storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const url = eventData.url;
            const data = eventData.data;
            return request.post(url, data);
        }).then(() => {
            return this.deleteFailedEvent(nativeBridge);
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    public sendFailedEvents(nativeBridge: NativeBridge, request: Request): Promise<void> {
        return nativeBridge.Storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            const promises = this.getPromisesForFailedEvents(nativeBridge, request, keys);
            return Promise.all(promises).then(() => {
                return Promise.resolve();
            });
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(nativeBridge: NativeBridge, request: Request, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedOperativeEventManager(this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(nativeBridge, request));
        });

        return promises;
    }
}
