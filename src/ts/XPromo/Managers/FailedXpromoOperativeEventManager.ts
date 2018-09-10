import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Request } from 'Core/Managers/Request';

export class FailedXpromoOperativeEventManager extends FailedOperativeEventManager {

    public getEventsStorageKey(): string {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.xpromooperative';
    }

    public sendFailedEvent(request: Request, writeStorage?: boolean): Promise<void> {
        return this._storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const kafkaType = eventData.kafkaType;
            const data = eventData.data;
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, JSON.parse(data));
        }).then(() => {
            return this.deleteFailedEvent().then(() => {
                if(writeStorage) {
                    this.writeStorage();
                }
            });
        }).catch((error) => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(request: Request, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedXpromoOperativeEventManager(this._storage, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request));
        });

        return promises;
    }
}
