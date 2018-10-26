import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class FailedXpromoOperativeEventManager extends FailedOperativeEventManager {

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.xpromooperative';
    }

    public sendFailedEvent(request: RequestManager, storageBridge: StorageBridge): Promise<void> {
        return this._storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const kafkaType = eventData.kafkaType;
            const data = eventData.data;
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, JSON.parse(data));
        }).then(() => {
            return this.deleteFailedEvent(storageBridge);
        }).catch((error) => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(storage: StorageApi, request: RequestManager, storageBridge: StorageBridge, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedXpromoOperativeEventManager(storage, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });

        return promises;
    }
}
