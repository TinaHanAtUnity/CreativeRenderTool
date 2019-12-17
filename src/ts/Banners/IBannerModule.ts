import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { BannerApi } from 'Banners/Native/BannerApi';
import { BannerListenerApi } from 'Banners/Native/BannerListenerApi';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { BannerAdContextManager } from 'Banners/Managers/BannerAdContextManager';

export interface IBannerNativeApi extends IModuleApi {
    BannerApi: BannerApi;
    BannerListenerApi: BannerListenerApi;
}

export interface IBannerModule extends IApiModule {
    readonly Api: Readonly<IBannerNativeApi>;
    AdUnitParametersFactory: BannerAdUnitParametersFactory;
    CampaignManager: BannerCampaignManager;
    PlacementManager: BannerPlacementManager;
    AdUnitFactory: BannerAdUnitFactory;
    BannerAdContextManager: BannerAdContextManager;
}
