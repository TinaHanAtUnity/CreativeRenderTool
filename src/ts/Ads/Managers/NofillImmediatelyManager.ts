import { PlacementState } from 'Ads/Models/Placement';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { LoadApi } from 'Core/Native/LoadApi';
import { IObserver1 } from 'Core/Utilities/IObserver';

const INITIAL_AD_REQUEST_WAIT_TIME_IN_MS = 250;

export class NofillImmediatelyManager {
    private _loadApi: LoadApi;
    private _listenerApi: ListenerApi;
    private _placementApi: PlacementApi;

    private _loadObserver: IObserver1<{ [key: string]: number }>;
    private _placementIds: string[];
    private _mediationInitCompleteStartTime: number;

    constructor(loadApi: LoadApi, listenerApi: ListenerApi, placementApi: PlacementApi, placementIds: string[]) {
        this._loadApi = loadApi;
        this._listenerApi = listenerApi;
        this._placementApi = placementApi;
        this._placementIds = placementIds;

        this.subscribeToLoads();
    }

    public setInitComplete(): void {
        if (!this._mediationInitCompleteStartTime) {
            this._mediationInitCompleteStartTime = performance.now();
        }
    }

    private subscribeToLoads() {
        this._loadObserver = this._loadApi.onLoad.subscribe((loads) => {
            // Sends nofills until 250ms threshold has been hit, then unregisters the listener
            if (this._mediationInitCompleteStartTime && (performance.now() - this._mediationInitCompleteStartTime > INITIAL_AD_REQUEST_WAIT_TIME_IN_MS)) {
                this._loadApi.onLoad.unsubscribe(this._loadObserver);
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
}
