import { Ads, AdsModule } from 'Ads/Ads';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerWebPlayerContainer } from 'Ads//Utilities/WebPlayer/BannerWebPlayerContainer';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { BannerApi } from 'Banners/Native/Banner';
import { BannerListenerApi } from 'Banners/Native/UnityBannerListener';

export interface IBannersApi extends IModuleApi {
    Banner: BannerApi;
    Listener: BannerListenerApi;
}

export class Banners extends AdsModule implements IApiModule {

    public readonly Api: IBannersApi;

    public BannerAdContext: BannerAdContext;

    private _initialized = false;

    constructor(ads: Ads) {
        super(ads);
    }

    public initialize(): Promise<void> {
        const bannerPlacementManager = new BannerPlacementManager(this.Ads.Api, this.Ads.Config);
        bannerPlacementManager.sendBannersReady();

        const bannerCampaignManager = new BannerCampaignManager(this.Ads.Core.NativeBridge.getPlatform(), this.Ads.Core.Api, this.Ads.Core.Config, this.Ads.Config, this.Ads.AssetManager, this.Ads.SessionManager, this.Ads.AdMobSignalFactory, this.Core.Request, this.Core.ClientInfo, this.Core.DeviceInfo, this.Core.MetaDataManager, this.Core.JaegerManager);
        const bannerWebPlayerContainer = new BannerWebPlayerContainer(this.Ads.Api);
        const bannerAdUnitParametersFactory = new BannerAdUnitParametersFactory(this.Ads.Core.NativeBridge.getPlatform(), this.Core.Api, this.Ads.Api, this.Core.Request, this.Core.MetaDataManager, this.Core.Config, this.Ads.Config, this.Ads.Container, this.Core.DeviceInfo, this.Core.ClientInfo, this.Ads.SessionManager, this.Core.FocusManager, this.Ads.AnalyticsManager, this.Ads.AdMobSignalFactory, this.Ads.GdprManager, bannerWebPlayerContainer, this.Ads.ProgrammaticTrackingService);
        this.BannerAdContext = new BannerAdContext(this.Api, bannerAdUnitParametersFactory, bannerCampaignManager, bannerPlacementManager, this.Core.FocusManager, this.Core.DeviceInfo);
        this._initialized = true;
        return Promise.resolve();
    }

    public isInitialized() {
        return this._initialized;
    }

}
