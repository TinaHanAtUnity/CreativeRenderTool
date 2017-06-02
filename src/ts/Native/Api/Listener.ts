import { NativeBridge } from 'Native/NativeBridge';
import { FinishState } from 'Constants/FinishState';
import { NativeApi } from 'Native/NativeApi';

export class ListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Listener');
    }

    public sendReadyEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendReadyEvent', [placementId]);
    }

    public sendStartEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendStartEvent', [placementId]);
    }

    public sendFinishEvent(placementId: string, result: FinishState): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendFinishEvent', [placementId, FinishState[result]]);
    }

    public sendClickEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendClickEvent', [placementId]);
    }

    public sendPlacementStateChangedEvent(placementId: string, oldState: string, newState: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendPlacementStateChangedEvent', [placementId, oldState, newState]);
    }

    public sendInitiatePurchaseEvent(eventString: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendInitiatePurchaseEvent', [eventString]);
    }

    public sendErrorEvent(error: string, message: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendErrorEvent', [error, message]);
    }

}
