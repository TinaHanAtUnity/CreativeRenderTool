import { NativeBridge } from 'Native/NativeBridge';
import { PlacementState } from 'Models/Placement';

export class PlacementApi {

    private static ApiClass = 'Placement';

    public static setDefaultPlacement(placementId: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(PlacementApi.ApiClass, 'setDefaultPlacement', [placementId]);
    }

    public static setPlacementState(placementId: string, placementState: PlacementState): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(PlacementApi.ApiClass, 'setPlacementState', [placementId, PlacementState[placementState]]);
    }

    public static setPlacementAnalytics(sendAnalytics: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(PlacementApi.ApiClass, 'setPlacementAnalytics', [sendAnalytics]);
    }

}
