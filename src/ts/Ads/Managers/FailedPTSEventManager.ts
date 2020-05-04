import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageType } from 'Core/Native/Storage';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class FailedPTSEventManager extends FailedOperativeEventManager {

    constructor(coreApi: ICoreApi, sessionId: string, eventId?: string) {
        super(coreApi, sessionId, eventId);
    }

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.ptsevent';
    }

    public sendFailedEvent(request: RequestManager, storageBridge: StorageBridge): Promise<void> {
        return this._core.Storage.get<{ [key: string]: unknown }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const url = <string>eventData.url;
            return request.get(url);
        }).then(() => {
            return this.deleteFailedEvent(storageBridge);
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(request: RequestManager, storageBridge: StorageBridge, keys: string[]): Promise<unknown>[] {
        const promises: Promise<unknown>[] = [];
        keys.map(eventId => {
            const manager = new FailedPTSEventManager(this._core, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });

        return promises;
    }
}
