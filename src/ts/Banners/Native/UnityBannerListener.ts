import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class BannerListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'BannerListener', ApiPackage.BANNER);
    }

    // Potentially change to send the position of banner rectangle
    public sendShowEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendShowEvent', [placementId]);
    }

    public sendLoadEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendLoadEvent', [placementId]);
    }

    public sendClickEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendClickEvent', [placementId]);
    }

    public sendHideEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendHideEvent', [placementId]);
    }

    public sendErrorEvent(error: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendErrorEvent', [error]);
    }
    public sendUnloadEvent(placementId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendUnloadEvent', [placementId]);
    }
}
