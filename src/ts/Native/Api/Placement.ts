import { NativeBridge } from 'Native/NativeBridge';
import { PlacementState } from 'Models/Placement';
import { ApiPackage, NativeApi } from 'Native/NativeApi';

export class PlacementApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Placement', ApiPackage.ADS_CORE);
    }

    public setDefaultPlacement(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDefaultPlacement', [placementId]);
    }

    public setPlacementState(placementId: string, placementState: PlacementState): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setPlacementState', [placementId, PlacementState[placementState]]);
    }

    public setPlacementAnalytics(sendAnalytics: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setPlacementAnalytics', [sendAnalytics]);
    }

}
