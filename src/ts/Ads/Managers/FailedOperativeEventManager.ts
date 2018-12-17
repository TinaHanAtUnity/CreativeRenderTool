import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageType } from 'Core/Native/Storage';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageOperation } from 'Core/Utilities/StorageOperation';
import { ICoreApi } from 'Core/ICore';
import { Url } from 'Core/Utilities/Url';

export class FailedOperativeEventManager {

    protected _core: ICoreApi;
    protected _sessionId: string;
    protected _eventId: string | undefined;

    constructor(core: ICoreApi, sessionId: string, eventId?: string) {
        this._core = core;
        this._sessionId = sessionId;
        this._eventId = eventId;
    }

    public getEventStorageKey(): string {
        return this.getEventsStorageKey() + '.' + this._eventId;
    }

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.operative';
    }

    public storeFailedEvent(storageBridge: StorageBridge, data: { [key: string]: unknown }): Promise<void> {
        if(this._eventId) {
            const operation = new StorageOperation(StorageType.PRIVATE);

            let url: string = <string>data.url;
            url = Url.addParameters(url, {
                eventRetry: true
            });

            data.url = url;

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
            return this._core.Storage.get<{ [key: string]: unknown }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
                const url = <string>eventData.url;
                const data = <string>eventData.data;
                return request.post(url, data);
            }).then(() => {
                return this.deleteFailedEvent(storageBridge);
            }).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }

        return Promise.resolve();
    }

    public sendFailedEvents(request: RequestManager, storageBridge: StorageBridge): Promise<unknown[]> {
        return this._core.Storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            return Promise.all(this.getPromisesForFailedEvents(request, storageBridge, keys));
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
            return Promise.resolve([]);
        });
    }

    protected getPromisesForFailedEvents(request: RequestManager, storageBridge: StorageBridge, keys: string[]): Promise<unknown>[] {
        const promises: Promise<unknown>[] = [];
        keys.map(eventId => {
            const manager = new FailedOperativeEventManager(this._core, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });

        return promises;
    }
}
