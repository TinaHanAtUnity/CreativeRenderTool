import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';

export class MonetizationListener {
    public static isMonetizationEnabled() {
        // EMPTY
    }
    public static sendPlacementContentReady(placementId: string) {
        // EMPTY
    }

    public static sendPlacementContentStateChanged(placementId: string, previousState: PlacementContentState, newState: PlacementContentState) {
        // EMPTY
    }
}
