import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class BannerListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'BannerListener', ApiPackage.BANNER);
    }

    public sendNoFillEvent(bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendNoFillEvent', [bannerAdViewId]);
    }

    public sendClickEvent(placementId: string, bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendClickEvent', [placementId, bannerAdViewId]);
    }

    public sendErrorEvent(error: string, bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendErrorEvent', [error, bannerAdViewId]);
    }

    public sendUnloadEvent(placementId: string, bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendUnloadEvent', [placementId, bannerAdViewId]);
    }
}
