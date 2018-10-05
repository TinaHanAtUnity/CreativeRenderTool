import { StorageApi, StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class MissedImpressionManager {
    private _storage: StorageApi;

    constructor(storage: StorageApi) {
        this._storage = storage;

        this._storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }

    private onStorageSet(eventType: string, data: any) {
        if(data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            HttpKafka.sendEvent('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, {
                ordinal: data.mediation.missedImpressionOrdinal.value
            });
            this._storage.delete(StorageType.PUBLIC, 'mediation.missedImpressionOrdinal');
            this._storage.write(StorageType.PUBLIC);
        }
    }
}
