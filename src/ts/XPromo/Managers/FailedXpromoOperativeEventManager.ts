import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Request } from 'Core/Utilities/Request';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class FailedXpromoOperativeEventManager extends FailedOperativeEventManager {

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.xpromooperative';
    }

    public sendFailedEvent(nativeBridge: NativeBridge, request: Request, storageBridge: StorageBridge): Promise<void> {
        return nativeBridge.Storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const kafkaType = eventData.kafkaType;
            const data = eventData.data;
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, JSON.parse(data));
        }).then(() => {
            return this.deleteFailedEvent(storageBridge);
        }).catch((error) => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(nativeBridge: NativeBridge, request: Request, storageBridge: StorageBridge, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedXpromoOperativeEventManager(this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(nativeBridge, request, storageBridge));
        });

        return promises;
    }
}
