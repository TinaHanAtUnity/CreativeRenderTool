import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { RequestManager } from 'Core/Managers/RequestManager';

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

    public storeFailedEvent(data: { [key: string]: any }): Promise<void> {
        if(this._eventId) {
            this._storage.set(StorageType.PRIVATE, this.getEventStorageKey(), data);
            this.writeStorage();
        }

        return Promise.resolve();
    }

    public deleteFailedEvent(): Promise<void> {
        if(this._eventId) {
            return this._storage.delete(StorageType.PRIVATE, this.getEventStorageKey()).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }

        return Promise.resolve();
    }

    public sendFailedEvent(request: RequestManager, writeStorage?: boolean): Promise<void> {
        if(this._eventId) {
            return this._storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
                const url = eventData.url;
                const data = eventData.data;
                return request.post(url, data);
            }).then(() => {
                return this.deleteFailedEvent().then(() => {
                    if(writeStorage) {
                        this.writeStorage();
                    }
                });
            }).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }

        return Promise.resolve();
    }

    public sendFailedEvents(request: RequestManager): Promise<void> {
        return this._storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            const promises = this.getPromisesForFailedEvents(request, keys);
            return Promise.all(promises).then(() => {
                return this.writeStorage();
            });
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(request: RequestManager, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedOperativeEventManager(this._storage, this._sessionId, eventId); // todo: wtf?
            promises.push(manager.sendFailedEvent(request));
        });

        return promises;
    }

    protected writeStorage(): Promise<void> {
        return this._storage.write(StorageType.PRIVATE).catch(() => {
            // Ignore errors
        });
    }
}
