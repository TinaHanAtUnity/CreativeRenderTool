import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { BackendApi } from '../BackendApi';

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
