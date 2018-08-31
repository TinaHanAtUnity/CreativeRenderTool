import { PlacementState } from 'Ads/Models/Placement';
import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';

export class PlacementApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Placement', ApiPackage.ADS);
    }

    public setDefaultPlacement(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDefaultPlacement', [placementId]);
    }

    public setDefaultBannerPlacement(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDefaultBannerPlacement', [placementId]);
    }

    public setPlacementState(placementId: string, placementState: PlacementState): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setPlacementState', [placementId, PlacementState[placementState]]);
    }

    public setPlacementAnalytics(sendAnalytics: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setPlacementAnalytics', [sendAnalytics]);
    }

}
