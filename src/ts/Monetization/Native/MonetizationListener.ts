import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';

export class MonetizationListenerApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'MonetizationListener', ApiPackage.MONETIZATION_CORE);
    }

    public isMonetizationEnabled(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isMonetizationEnabled');
    }

    public sendPlacementContentReady(placementId: string): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendPlacementContentReady', [placementId]);
    }

    public sendPlacementContentStateChanged(placementId: string, previousState: PlacementContentState, newState: PlacementContentState): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendPlacementContentStateChanged', [placementId, PlacementContentState[previousState], PlacementContentState[newState]]);
    }
}
