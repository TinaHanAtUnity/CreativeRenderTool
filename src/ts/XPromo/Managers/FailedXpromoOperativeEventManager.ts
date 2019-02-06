import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class FailedXpromoOperativeEventManager extends FailedOperativeEventManager {

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.xpromooperative';
    }

    public sendFailedEvent(request: RequestManager, storageBridge: StorageBridge): Promise<void> {
        return this._core.Storage.get<{ [key: string]: unknown }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const kafkaType = <string>eventData.kafkaType;
            const data = <string>eventData.data;
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, JSON.parse(data));
        }).then(() => {
            return this.deleteFailedEvent(storageBridge);
        }).catch((error) => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(request: RequestManager, storageBridge: StorageBridge, keys: string[]): Promise<unknown>[] {
        const promises: Promise<unknown>[] = [];
        keys.map(eventId => {
            const manager = new FailedXpromoOperativeEventManager(this._core, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });

        return promises;
    }
}
