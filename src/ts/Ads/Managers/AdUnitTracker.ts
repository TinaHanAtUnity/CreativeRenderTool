import { LoadApi } from 'Core/Native/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { ProgrammaticTrackingService, AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ListenerApi } from 'Ads/Native/Listener';

enum AdUnitState {
    LOADING,
    FILL
}

export class AdUnitTracker {
    private _mediationName: string;
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _refreshManager: TrackableRefreshManager;

    private _states: { [key: string]: AdUnitState };

    constructor(mediation: string, loadApi: LoadApi, listener: ListenerApi, refreshManager: TrackableRefreshManager, pts: ProgrammaticTrackingService) {
        this._mediationName = mediation;
        this._loadApi = loadApi;
        this._listener = listener;
        this._refreshManager = refreshManager;

        this._states = {};

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, nextState) => this.onPlacementStateChangedEventSent(placementId, oldState, nextState));
        this._refreshManager.onAdUnitChanged.subscribe((placementId) => this.onAdUnitChanged(placementId));
    }

    private onLoad(placements: { [key: string]: number }): void {
        Object.keys(placements).forEach((placementId) => {
            if (this._states[placementId] !== undefined) {
                switch (this._states[placementId]) {
                    case AdUnitState.LOADING:
                        ProgrammaticTrackingService.reportMetricEventWithTags(AdUnitTracking.DuplicateLoadForPlacement, [
                            ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName)
                        ]);
                        break;
                    case AdUnitState.FILL:
                        ProgrammaticTrackingService.reportMetricEventWithTags(AdUnitTracking.PossibleDuplicateLoadForPlacement, [
                            ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName)
                        ]);
                        break;
                    default:
                }
            } else {
                ProgrammaticTrackingService.reportMetricEventWithTags(AdUnitTracking.InitialLoadRequest, [
                    ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName)
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

        ProgrammaticTrackingService.reportMetricEventWithTags(AdUnitTracking.AttemptToShowAd, [
            ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName)
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
                ProgrammaticTrackingService.reportMetricEventWithTags(AdUnitTracking.FailedToInvalidate, [
                    ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName)
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
