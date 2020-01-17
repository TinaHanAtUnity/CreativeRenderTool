import { LoadApi } from 'Core/Native/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { ProgrammaticTrackingService, AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ListenerApi } from 'Ads/Native/Listener';

enum AdUnitState {
    LOADING,
    FILL,
    INVALIDATING
}

export class AdUnitTracker {
    private _mediationName: string;
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _refreshManager: TrackableRefreshManager;
    private _pts: ProgrammaticTrackingService;
    private _insideLoad: boolean;

    private _states: { [key: string]: AdUnitState };

    constructor(mediation: string, loadApi: LoadApi, listener: ListenerApi, refreshManager: TrackableRefreshManager, pts: ProgrammaticTrackingService) {
        this._mediationName = mediation;
        this._loadApi = loadApi;
        this._listener = listener;
        this._refreshManager = refreshManager;
        this._pts = pts;

        this._states = {};
        this._insideLoad = false;

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, nextState) => this.onPlacementStateChangedEventSent(placementId, oldState, nextState));
        this._refreshManager.onAdUnitChanged.subscribe((placementId) => this.onAdUnitChanged(placementId));
    }

    public postInit() {
        this._loadApi.onLoad.subscribe((placements) => this.onPostLoad(placements));
    }

    private onPostLoad(placements: { [key: string]: number }): void {
        this._insideLoad = false;
    }

    private onLoad(placements: { [key: string]: number }): void {
        this._insideLoad = true;
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
            if (this._states[placementId] === AdUnitState.INVALIDATING) {
                this._pts.reportMetricEventWithTags(AdUnitTracking.SuccessfulInvalidate, [
                    this._pts.createAdsSdkTag('med', this._mediationName)
                ]);
            }
            this._states[placementId] = AdUnitState.FILL;
        } else if (newState === 'NO_FILL') {
            if (this._states[placementId] === AdUnitState.FILL) {
                this._pts.reportMetricEventWithTags(AdUnitTracking.PossibleCampaignExpired, [
                    this._pts.createAdsSdkTag('med', this._mediationName)
                ]);
            }
            delete this._states[placementId];
        } else if (newState === 'NOT_AVAILABLE') {
            delete this._states[placementId];
        }  else if (newState === 'DISABLED') {
            delete this._states[placementId];
        } else if (newState === 'WAITING' && this._states[placementId] === AdUnitState.FILL) {
            if (!this._insideLoad) {
                this._pts.reportMetricEventWithTags(AdUnitTracking.AttemptToInvalidate, [
                    this._pts.createAdsSdkTag('med', this._mediationName)
                ]);

                this._states[placementId] = AdUnitState.INVALIDATING;
            }
        }
    }
}
