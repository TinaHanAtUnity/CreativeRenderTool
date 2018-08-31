import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { Request } from 'Core/Utilities/Request';

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

    public storeFailedEvent(nativeBridge: NativeBridge, data: { [key: string]: any }): Promise<void> {
        if(this._eventId) {
            nativeBridge.Storage.set(StorageType.PRIVATE, this.getEventStorageKey(), data);
            this.writeStorage(nativeBridge);
        }

        return Promise.resolve();
    }

    public deleteFailedEvent(nativeBridge: NativeBridge): Promise<void> {
        if(this._eventId) {
            return nativeBridge.Storage.delete(StorageType.PRIVATE, this.getEventStorageKey()).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }

        return Promise.resolve();
    }

    public sendFailedEvent(nativeBridge: NativeBridge, request: Request, writeStorage?: boolean): Promise<void> {
        if(this._eventId) {
            return nativeBridge.Storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
                const url = eventData.url;
                const data = eventData.data;
                return request.post(url, data);
            }).then(() => {
                return this.deleteFailedEvent(nativeBridge).then(() => {
                    if(writeStorage) {
                        this.writeStorage(nativeBridge);
                    }
                });
            }).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }

        return Promise.resolve();
    }

    public sendFailedEvents(nativeBridge: NativeBridge, request: Request): Promise<void> {
        return nativeBridge.Storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            const promises = this.getPromisesForFailedEvents(nativeBridge, request, keys);
            return Promise.all(promises).then(() => {
                return this.writeStorage(nativeBridge);
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

    protected writeStorage(nativeBridge: NativeBridge): Promise<void> {
        return nativeBridge.Storage.write(StorageType.PRIVATE).catch(() => {
            // Ignore errors
        });
    }
}
