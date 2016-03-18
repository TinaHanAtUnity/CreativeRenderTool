import { NativeBridge } from 'Native/NativeBridge';
import { FinishState } from 'Constants/FinishState';

export class ListenerApi {

    private static ApiClass = 'Listener';

    public static sendReadyEvent(placementId: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(ListenerApi.ApiClass, 'sendReadyEvent', [placementId]);
    }

    public static sendStartEvent(placementId: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(ListenerApi.ApiClass, 'sendStartEvent', [placementId]);
    }

    public static sendFinishEvent(placementId, result: FinishState): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(ListenerApi.ApiClass, 'sendFinishEvent', [placementId, FinishState[result]]);
    }

    public static sendErrorEvent(error: string, message: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(ListenerApi.ApiClass, 'sendErrorEvent', [error, message]);
    }

    public static sendClickEvent(placementId): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(ListenerApi.ApiClass, 'sendClickEvent', [placementId]);
    }

}
