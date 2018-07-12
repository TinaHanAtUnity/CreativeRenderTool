import { NativeBridge } from 'Native/NativeBridge';
import { FinishState } from 'Constants/FinishState';
import { ApiPackage, NativeApi } from 'Native/NativeApi';

export class ListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Listener', ApiPackage.ADS_CORE);
    }

    public sendReadyEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'sendReadyEvent', [placementId]);
    }

    public sendStartEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'sendStartEvent', [placementId]);
    }

    public sendFinishEvent(placementId: string, result: FinishState): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'sendFinishEvent', [placementId, FinishState[result]]);
    }

    public sendClickEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'sendClickEvent', [placementId]);
    }

    public sendPlacementStateChangedEvent(placementId: string, oldState: string, newState: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'sendPlacementStateChangedEvent', [placementId, oldState, newState]);
    }

    public sendErrorEvent(error: string, message: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'sendErrorEvent', [error, message]);
    }

}
