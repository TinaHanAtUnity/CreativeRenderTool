import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageOperation } from 'Core/Utilities/StorageOperation';

export class FailedOperativeEventManager {

    protected _storage: StorageApi;
    protected _sessionId: string;
    protected _eventId: string | undefined;

    constructor(storage: StorageApi, sessionId: string, eventId?: string) {
        this._storage = storage;
        this._sessionId = sessionId;
        this._eventId = eventId;
    }

    public getEventStorageKey(): string {
        return this.getEventsStorageKey() + '.' + this._eventId;
    }

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.operative';
    }

    public storeFailedEvent(storageBridge: StorageBridge, data: { [key: string]: any }): Promise<void> {
        if(this._eventId) {
            const operation = new StorageOperation(StorageType.PRIVATE);
            operation.set(this.getEventStorageKey(), data);
            storageBridge.queue(operation);
        }

        return Promise.resolve();
    }

    public deleteFailedEvent(storageBridge: StorageBridge): Promise<void> {
        if(this._eventId) {
            const operation = new StorageOperation(StorageType.PRIVATE);
            operation.delete(this.getEventStorageKey());
            storageBridge.queue(operation);
        }

        return Promise.resolve();
    }

    public sendFailedEvent(request: RequestManager, storageBridge: StorageBridge): Promise<void> {
        if(this._eventId) {
            return this._storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
                const url = eventData.url;
                const data = eventData.data;
                return request.post(url, data);
            }).then(() => {
                return this.deleteFailedEvent(storageBridge);
            }).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }

        return Promise.resolve();
    }

    public sendFailedEvents(storage: StorageApi, request: RequestManager, storageBridge: StorageBridge): Promise<any[]> {
        return storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            return Promise.all(this.getPromisesForFailedEvents(storage, request, storageBridge, keys));
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
            return Promise.resolve([]);
        });
    }

    protected getPromisesForFailedEvents(storage: StorageApi, request: RequestManager, storageBridge: StorageBridge, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedOperativeEventManager(storage, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });

        return promises;
    }
}
