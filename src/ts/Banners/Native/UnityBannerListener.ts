import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';

export class BannerListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'BannerListener', ApiPackage.BANNER);
    }

    public sendLoadEvent(bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendLoadEvent', [bannerAdViewId]);
    }

    public sendNoFillEvent(bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendNoFillEvent', [bannerAdViewId]);
    }

    public sendClickEvent(bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendClickEvent', [bannerAdViewId]);
    }

    public sendLeaveApplicationEvent(bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendLeaveApplicationEvent', [bannerAdViewId]);
    }

    public sendErrorEvent(bannerAdViewId: string, bannerErrorCode: BannerErrorCode, errorMessage: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendErrorEvent', [bannerAdViewId, bannerErrorCode, errorMessage]);
    }

}
