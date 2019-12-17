import { FinishState } from 'Core/Constants/FinishState';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1 } from 'Core/Utilities/Observable';

export class ListenerApi extends NativeApi {
    public readonly onPlacementStateChangeToNofill = new Observable1<string>();
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Listener', ApiPackage.ADS);
    }

    public sendReadyEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendReadyEvent', [placementId]);
    }

    public sendStartEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendStartEvent', [placementId]);
    }

    public sendFinishEvent(placementId: string, result: FinishState): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendFinishEvent', [placementId, FinishState[result]]);
    }

    public sendClickEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendClickEvent', [placementId]);
    }

    public sendPlacementStateChangedEvent(placementId: string, oldState: string, newState: string): Promise<void> {
        if (newState === 'NO_FILL') {
            this.onPlacementStateChangeToNofill.trigger(placementId);
        }
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendPlacementStateChangedEvent', [placementId, oldState, newState]);
    }

    public sendErrorEvent(error: string, message: string): Promise<void> {
        // Uses same codepath as Core/Native/Listener.sendErrorEvent
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendErrorEvent', [error, message]);
    }

}
