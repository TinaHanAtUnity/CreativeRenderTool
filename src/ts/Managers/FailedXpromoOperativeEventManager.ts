import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';
import { FailedOperativeEventManager } from 'Managers/FailedOperativeEventManager';
import { SessionManager } from 'Managers/SessionManager';

export class FailedXpromoOperativeEventManager extends FailedOperativeEventManager {

    public getEventsStorageKey(): string {
        return SessionManager.getSessionKey(this._sessionId) + '.xpromooperative';
    }

    public sendFailedEvent(nativeBridge: NativeBridge, request: Request): Promise<void> {
        return nativeBridge.Storage.get<{ [key: string]: any }>(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const kafkaType = eventData.kafkaType;
            const data = eventData.data;
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, JSON.parse(data));
        }).then(() => {
            return this.deleteFailedEvent(nativeBridge);
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }

    protected getPromisesForFailedEvents(nativeBridge: NativeBridge, request: Request, keys: string[]): Array<Promise<any>> {
        const promises: Array<Promise<any>> = [];
        keys.map(eventId => {
            const manager = new FailedXpromoOperativeEventManager(this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(nativeBridge, request));
        });

        return promises;
    }
}
