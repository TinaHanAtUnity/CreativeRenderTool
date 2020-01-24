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
    private _mediationName: string;
    private _sdkVersion: string;

    constructor(core: ICoreApi, mediationName: string, sdkVersion: string) {
        this._core = core;
        this._mediationName = mediationName;
        this._sdkVersion = sdkVersion;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <IMissedImpressionOrdinalData>data));
    }

    private onStorageSet(eventType: string, data: IMissedImpressionOrdinalData) {
        if (data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            HttpKafka.sendEvent('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, {
                ordinal: data.mediation.missedImpressionOrdinal.value
            });
            ProgrammaticTrackingService.reportMetricEventWithTags(AdUnitTracking.RealMissedImpression, [
                ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName),
                ProgrammaticTrackingService.createAdsSdkTag('sdv', this._sdkVersion)
            ]);
            this._core.Storage.delete(StorageType.PUBLIC, 'mediation.missedImpressionOrdinal');
            this._core.Storage.write(StorageType.PUBLIC);
        }
    }
}
