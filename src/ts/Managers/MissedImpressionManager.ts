import { NativeBridge } from 'Native/NativeBridge';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';
import { StorageType } from 'Native/Api/Storage';

export class MissedImpressionManager {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }

    private onStorageSet(eventType: string, data: any) {
        if(data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            HttpKafka.sendEvent('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, {
                ordinal: data.mediation.missedImpressionOrdinal.value
            });
            this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'mediation.missedImpressionOrdinal');
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
        }
    }
}
