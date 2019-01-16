import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerApi } from 'Banners/Native/Banner';
import { BannerListenerApi } from 'Banners/Native/UnityBannerListener';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

export interface IBannersApi extends IModuleApi {
    Banner: BannerApi;
    Listener: BannerListenerApi;
}

export interface IBanners extends IApiModule {
    readonly Api: Readonly<IBannersApi>;
    AdContext: BannerAdContext;
    AdUnitParametersFactory: BannerAdUnitParametersFactory;
    CampaignManager: BannerCampaignManager;
    PlacementManager: BannerPlacementManager;
    WebPlayerContainer: WebPlayerContainer;
}
