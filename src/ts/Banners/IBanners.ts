import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerApi } from 'Banners/Native/Banner';
import { BannerListenerApi } from 'Banners/Native/UnityBannerListener';

export interface IBannersApi extends IModuleApi {
    Banner: BannerApi;
    Listener: BannerListenerApi;
}

export interface IBanners extends IApiModule {
    readonly Api: Readonly<IBannersApi>;
    BannerAdContext: BannerAdContext;
}
