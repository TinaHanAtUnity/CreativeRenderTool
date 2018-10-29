import { BackendApi } from 'Backend/BackendApi';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';

export class MonetizationListener extends BackendApi {
    public isMonetizationEnabled() {
        // EMPTY
        return false;
    }
    public sendPlacementContentReady(placementId: string) {
        // EMPTY
    }

    public sendPlacementContentStateChanged(placementId: string, previousState: PlacementContentState, newState: PlacementContentState) {
        // EMPTY
    }
}
