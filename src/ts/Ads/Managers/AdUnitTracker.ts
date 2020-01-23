import { LoadApi } from 'Core/Native/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { ProgrammaticTrackingService, AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ListenerApi } from 'Ads/Native/Listener';
import { StorageApi } from 'Core/Native/Storage';

enum AdUnitState {
    LOADING,
    FILL
}

export interface IMediationData {
    mediation: {
        ordinal: {
            value: number;
        };
        missedImpressionOrdinal: {
            value: number;
        };
    };
}

export class AdUnitTracker {
    private _mediationName: string;
    private _loadApi: LoadApi;
    private _storageApi: StorageApi;
    private _listener: ListenerApi;
    private _refreshManager: TrackableRefreshManager;
    private _pts: ProgrammaticTrackingService;

    private _states: { [key: string]: AdUnitState };

    constructor(mediation: string, loadApi: LoadApi, storageApi: StorageApi, listener: ListenerApi, refreshManager: TrackableRefreshManager, pts: ProgrammaticTrackingService) {
        this._mediationName = mediation;
        this._loadApi = loadApi;
        this._storageApi = storageApi;
        this._listener = listener;
        this._refreshManager = refreshManager;
        this._pts = pts;

        this._states = {};

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, nextState) => this.onPlacementStateChangedEventSent(placementId, oldState, nextState));
        this._refreshManager.onAdUnitChanged.subscribe((placementId) => this.onAdUnitChanged(placementId));
        this._storageApi.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <IMediationData>data));

    }

    private onStorageSet(eventType: string, data: IMediationData) {
        if (data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            this._pts.reportMetricEventWithTags(AdUnitTracking.MissedImpression, [
                this._pts.createAdsSdkTag('med', this._mediationName)
            ]);
        }

        if (data && data.mediation && data.mediation.ordinal && data.mediation.ordinal.value && !data.mediation.missedImpressionOrdinal) {
            this._pts.reportMetricEventWithTags(AdUnitTracking.MediationShowCall, [
                this._pts.createAdsSdkTag('med', this._mediationName)
            ]);
        }
    }

    private onLoad(placements: { [key: string]: number }): void {
        Object.keys(placements).forEach((placementId) => {
            if (this._states[placementId] !== undefined) {
                switch (this._states[placementId]) {
                    case AdUnitState.LOADING:
                        this._pts.reportMetricEventWithTags(AdUnitTracking.DuplicateLoadForPlacement, [
                            this._pts.createAdsSdkTag('med', this._mediationName)
                        ]);
                        break;
                    case AdUnitState.FILL:
                        this._pts.reportMetricEventWithTags(AdUnitTracking.PossibleDuplicateLoadForPlacement, [
                            this._pts.createAdsSdkTag('med', this._mediationName)
                        ]);
                        break;
                    default:
                }
            } else {
                this._pts.reportMetricEventWithTags(AdUnitTracking.InitialLoadRequest, [
                    this._pts.createAdsSdkTag('med', this._mediationName)
                ]);
                this._states[placementId] = AdUnitState.LOADING;
            }
        });
    }

    private onAdUnitChanged(placementId: string): void {
        if (this._states[placementId] === undefined) {
            return;
        }

        delete this._states[placementId];

        this._pts.reportMetricEventWithTags(AdUnitTracking.AttemptToShowAd, [
            this._pts.createAdsSdkTag('med', this._mediationName)
        ]);
    }

    private onPlacementStateChangedEventSent(placementId: string, oldState: string, newState: string): void {
        if (this._states[placementId] === undefined) {
            return;
        }

        if (newState === 'READY') {
            this._states[placementId] = AdUnitState.FILL;
        } else if (newState === 'NO_FILL') {
            if (this._states[placementId] === AdUnitState.FILL) {
                this._pts.reportMetricEventWithTags(AdUnitTracking.FailedToInvalidate, [
                    this._pts.createAdsSdkTag('med', this._mediationName)
                ]);
            }
            delete this._states[placementId];
        } else if (newState === 'NOT_AVAILABLE') {
            delete this._states[placementId];
        }  else if (newState === 'DISABLED') {
            delete this._states[placementId];
        }
    }
}
