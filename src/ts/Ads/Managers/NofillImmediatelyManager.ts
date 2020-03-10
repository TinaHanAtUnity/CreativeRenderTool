import { ListenerApi } from 'Ads/Native/Listener';
import { LoadApi } from 'Core/Native/LoadApi';
import { Observable1 } from 'Core/Utilities/Observable';
import { IObserver1 } from 'Core/Utilities/IObserver';
import { PlacementState } from 'Ads/Models/Placement';
import { PlacementApi } from 'Ads/Native/Placement';
import { IAdsApi } from 'Ads/IAds';

const INITIAL_AD_REQUEST_WAIT_TIME_IN_MS = 250;

export enum MediationExperimentType {
    NofillImmediately = 'nfi',
    CacheModeAllowed = 'cma',
    None = 'none'
}

export class NofillImmediatelyManager {
    private _placementApi: PlacementApi;
    private _listenerApi: ListenerApi;
    private _loadObserver: IObserver1<{ [key: string]: number }>;
    private _onLoad: Observable1<{ [key: string]: number }>;
    private _placementIds: string[];
    private _mediationInitCompleteStartTime: number;

    constructor(adsApi: IAdsApi, placementIds: string[]) {
        this._onLoad = adsApi.LoadApi.onLoad;
        this._placementApi = adsApi.Placement;
        this._listenerApi = adsApi.Listener;
        this._placementIds = placementIds;
    }

    public subscribeToLoads() {
        this._loadObserver = this._onLoad.subscribe((loads) => {
            // Sends nofills until 250ms threshold has been hit, then unregisters the listener
            if (this._mediationInitCompleteStartTime && (performance.now() - this._mediationInitCompleteStartTime > INITIAL_AD_REQUEST_WAIT_TIME_IN_MS)) {
                this._onLoad.unsubscribe(this._loadObserver);
            } else {
                Object.keys(loads).forEach((placementId) => {
                    if (this._placementIds.includes(placementId)) {
                        this._placementApi.setPlacementState(placementId, PlacementState.NO_FILL);
                        this._listenerApi.sendPlacementStateChangedEvent(placementId, PlacementState[PlacementState.NOT_AVAILABLE], PlacementState[PlacementState.NO_FILL]);
                    }
                });
            }
        });
    }

    public setInitComplete(): void {
        if (!this._mediationInitCompleteStartTime) {
            this._mediationInitCompleteStartTime = performance.now();
        }
    }
}
