import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ICoreApi } from 'Core/ICore';

export interface IMissedImpressionOrdinalData {
    mediation: {
        missedImpressionOrdinal: {
            value: number;
        };
    };
}

export class MissedImpressionManager {
    private _core: ICoreApi;

    constructor(core: ICoreApi) {
        this._core = core;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <IMissedImpressionOrdinalData>data));
    }

    private onStorageSet(eventType: string, data: IMissedImpressionOrdinalData) {
        if(data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            HttpKafka.sendEvent('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, {
                ordinal: data.mediation.missedImpressionOrdinal.value
            });
            this._core.Storage.delete(StorageType.PUBLIC, 'mediation.missedImpressionOrdinal');
            this._core.Storage.write(StorageType.PUBLIC);
        }
    }
}
