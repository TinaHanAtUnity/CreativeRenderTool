import { BannerWebPlayerContainer } from 'Ads//Utilities/WebPlayer/BannerWebPlayerContainer';
import { IAds } from 'Ads/IAds';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerApi } from 'Banners/Native/Banner';
import { BannerListenerApi } from 'Banners/Native/UnityBannerListener';
import { ICore } from 'Core/ICore';
import { IBanners, IBannersApi } from 'Banners/IBanners';

export class Banners implements IBanners {

    public readonly Api: Readonly<IBannersApi>;

    public BannerAdContext: BannerAdContext;

    constructor(core: ICore, ads: IAds) {
        this.Api = {
            Banner: new BannerApi(core.NativeBridge),
            Listener: new BannerListenerApi(core.NativeBridge)
        };

        const bannerPlacementManager = new BannerPlacementManager(ads.Api, ads.Config);
        bannerPlacementManager.sendBannersReady();

        const bannerCampaignManager = new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.AssetManager, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, core.JaegerManager);
        const bannerWebPlayerContainer = new BannerWebPlayerContainer(core.NativeBridge.getPlatform(), ads.Api);
        const bannerAdUnitParametersFactory = new BannerAdUnitParametersFactory(core.NativeBridge.getPlatform(), core.Api, core.RequestManager, core.ClientInfo, bannerWebPlayerContainer, core.MetaDataManager);
        this.BannerAdContext = new BannerAdContext(this.Api, bannerAdUnitParametersFactory, bannerCampaignManager, bannerPlacementManager, core.FocusManager, core.DeviceInfo);
    }

}
