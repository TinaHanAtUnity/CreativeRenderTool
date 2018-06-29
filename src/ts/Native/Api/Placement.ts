import { NativeBridge } from 'Native/NativeBridge';
import { PlacementState } from 'Models/Placement';
import { NativeApi } from 'Native/NativeApi';

export class PlacementApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Placement');
    }

    public setDefaultPlacement(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDefaultPlacement', [placementId]);
    }

    public setDefaultBannerPlacement(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDefaultBannerPlacement', [placementId]);
    }

    public setPlacementState(placementId: string, placementState: PlacementState): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setPlacementState', [placementId, PlacementState[placementState]]);
    }

    public setPlacementAnalytics(sendAnalytics: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setPlacementAnalytics', [sendAnalytics]);
    }

}
