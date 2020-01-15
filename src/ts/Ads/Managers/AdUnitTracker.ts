import { LoadApi } from 'Core/Native/LoadApi';
import { TrackableRefreshManager } from 'Ads/Managers/TrackableRefreshManager';
import { PlacementState } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService, AdUnitTracking } from 'Ads/Utilities/ProgrammaticTrackingService';

enum AdUnitState {
    LOADING,
    FILL,
    INVALIDATING
}

export class AdUnitTracker {
    private _gameId: string;
    private _mediation: string;
    private _loadApi: LoadApi;
    private _refreshManager: TrackableRefreshManager;
    private _pts: ProgrammaticTrackingService;

    private _states: { [key: string]: AdUnitState };

    constructor(gameId: string, mediation: string, loadApi: LoadApi, refreshManager: TrackableRefreshManager, pts: ProgrammaticTrackingService) {
        this._gameId = gameId;
        this._mediation = mediation;
        this._loadApi = loadApi;
        this._refreshManager = refreshManager;
        this._pts = pts;

        this._states = {};

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._refreshManager.onPlacementStateChanged.subscribe((placementId, placementState) => this.onPlacementStateChanged(placementId, placementState));
        this._refreshManager.onAdUnitChanged.subscribe((placementId) => this.onAdUnitChanged(placementId));
    }

    private onLoad(placements: { [key: string]: number }): void {
        Object.keys(placements).forEach((placementId) => {
            if (this._states[placementId] !== undefined) {
                switch (this._states[placementId]) {
                    case AdUnitState.LOADING:
                        this._pts.reportMetricEventWithTags(AdUnitTracking.DuplicateLoadForPlacement, [
                            this._pts.createAdsSdkTag('med', this._mediation)
                        ]);
                        break;
                    case AdUnitState.FILL:
                        this._pts.reportMetricEventWithTags(AdUnitTracking.PossibleDuplicateLoadForPlacement, [
                            this._pts.createAdsSdkTag('med', this._mediation)
                        ]);
                        break;
                    default:
                }
            } else {
                this._pts.reportMetricEventWithTags(AdUnitTracking.InitialLoadRequest, [
                    this._pts.createAdsSdkTag('med', this._mediation)
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
            this._pts.createAdsSdkTag('med', this._mediation)
        ]);
    }

    private onPlacementStateChanged(placementId: string, placementState: PlacementState): void {
        if (this._states[placementId] === undefined) {
            return;
        }

        if (placementState === PlacementState.READY) {
            if (this._states[placementId] === AdUnitState.INVALIDATING) {
                this._pts.reportMetricEventWithTags(AdUnitTracking.SuccessfulInvalidate, [
                    this._pts.createAdsSdkTag('med', this._mediation)
                ]);
            }
            this._states[placementId] = AdUnitState.FILL;
        } else if (placementState === PlacementState.NO_FILL) {
            this._pts.reportMetricEventWithTags(AdUnitTracking.PossibleCampaignExpired, [
                this._pts.createAdsSdkTag('med', this._mediation)
            ]);
            delete this._states[placementId];
        } else if (placementState === PlacementState.NOT_AVAILABLE) {
            delete this._states[placementId];
        }  else if (placementState === PlacementState.DISABLED) {
            delete this._states[placementId];
        } else if (placementState === PlacementState.WAITING && this._states[placementId] === AdUnitState.FILL) {
            this._pts.reportMetricEventWithTags(AdUnitTracking.AttemptToInvalidate, [
                this._pts.createAdsSdkTag('med', this._mediation)
            ]);

            this._states[placementId] = AdUnitState.INVALIDATING;
        }
    }
}
