import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { Request } from 'Core/Utilities/Request';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageOperation } from 'Core/Utilities/StorageOperation';

export class FailedOperativeEventManager {

    protected _sessionId: string;
    protected _eventId: string | undefined;

    constructor(sessionId: string, eventId?: string) {
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

    public sendFailedEvent(nativeBridge: NativeBridge, request: Request, storageBridge: StorageBridge): Promise<void> {
        if(this._eventId) {
            return nativeBridge.Storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
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

    public sendFailedEvents(nativeBridge: NativeBridge, request: Request, storageBridge: StorageBridge): Promise<any[]> {
        return nativeBridge.Storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            return Promise.all(this.getPromisesForFailedEvents(nativeBridge, request, storageBridge, keys));
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
            return Promise.resolve([]);
        });
    }

    protected getPromisesForFailedEvents(nativeBridge: NativeBridge, request: Request, storageBridge: StorageBridge, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedOperativeEventManager(this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(nativeBridge, request, storageBridge));
        });

        return promises;
    }
}
