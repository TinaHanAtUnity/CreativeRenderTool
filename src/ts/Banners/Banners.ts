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
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';

export class Banners implements IBanners {

    public readonly Api: Readonly<IBannersApi>;

    public BannerAdContext: BannerAdContext;
    public AdContext: BannerAdContext;
    public AdUnitParametersFactory: BannerAdUnitParametersFactory;
    public CampaignManager: BannerCampaignManager;
    public PlacementManager: BannerPlacementManager;
    public WebPlayerContainer: WebPlayerContainer;
    public AdUnitFactory: BannerAdUnitFactory;

    constructor(core: ICore, ads: IAds) {
        this.Api = {
            Banner: new BannerApi(core.NativeBridge),
            Listener: new BannerListenerApi(core.NativeBridge)
        };

        this.PlacementManager = new BannerPlacementManager(ads.Api, ads.Config);
        this.PlacementManager.sendBannersReady();

        this.AdUnitFactory = new BannerAdUnitFactory();
        this.CampaignManager = new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.AssetManager, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, core.JaegerManager);
        this.WebPlayerContainer = new BannerWebPlayerContainer(core.NativeBridge.getPlatform(), ads.Api);
        this.AdUnitParametersFactory = new BannerAdUnitParametersFactory(this, ads, core);
        this.BannerAdContext = new BannerAdContext(this, ads, core);
    }
}
