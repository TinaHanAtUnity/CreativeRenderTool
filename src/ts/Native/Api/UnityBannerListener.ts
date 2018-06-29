import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class BannerListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'BannerListener');
    }

    // Potentially change to send the position of banner rectangle
    public sendShowEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendShowEvent', [placementId]);
    }

    public sendLoadEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendLoadEvent', [placementId]);
    }

    public sendClickEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendClickEvent', [placementId]);
    }

    public sendHideEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendHideEvent', [placementId]);
    }

    public sendErrorEvent(error: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendErrorEvent', [error]);
    }
    public sendUnloadEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendUnloadEvent', [placementId]);
    }
}
