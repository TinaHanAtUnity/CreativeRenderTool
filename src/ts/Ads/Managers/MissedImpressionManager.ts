import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ICoreApi } from 'Core/ICore';
import { ProgrammaticTrackingService, AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';

export interface IMissedImpressionOrdinalData {
    mediation: {
        missedImpressionOrdinal: {
            value: number;
        };
    };
}

export class MissedImpressionManager {
    private _core: ICoreApi;
    private _pts: ProgrammaticTrackingService;
    private _mediationName: string;

    constructor(core: ICoreApi, pts: ProgrammaticTrackingService, mediationName: string) {
        this._core = core;
        this._pts = pts;
        this._mediationName = mediationName;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <IMissedImpressionOrdinalData>data));
    }

    private onStorageSet(eventType: string, data: IMissedImpressionOrdinalData) {
        if (data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            HttpKafka.sendEvent('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, {
                ordinal: data.mediation.missedImpressionOrdinal.value
            });
            this._pts.reportMetricEventWithTags(AdUnitTracking.RealMissedImpression, [
                this._pts.createAdsSdkTag('med', this._mediationName)
            ]);
            this._core.Storage.delete(StorageType.PUBLIC, 'mediation.missedImpressionOrdinal');
            this._core.Storage.write(StorageType.PUBLIC);
        }
    }
}
