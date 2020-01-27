import { IAds } from 'Ads/IAds';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerApi } from 'Banners/Native/BannerApi';
import { BannerListenerApi } from 'Banners/Native/BannerListenerApi';
import { ICore } from 'Core/ICore';
import { IBannerModule, IBannerNativeApi } from 'Banners/IBannerModule';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { BannerAdContextManager } from 'Banners/Managers/BannerAdContextManager';

export class BannerModule implements IBannerModule {

    public readonly Api: Readonly<IBannerNativeApi>;
    public AdUnitParametersFactory: BannerAdUnitParametersFactory;
    public CampaignManager: BannerCampaignManager;
    public PlacementManager: BannerPlacementManager;
    public AdUnitFactory: BannerAdUnitFactory;
    public BannerAdContextManager: BannerAdContextManager;

    constructor(core: ICore, ads: IAds) {
        this.Api = {
            BannerApi: new BannerApi(core.NativeBridge),
            BannerListenerApi: new BannerListenerApi(core.NativeBridge)
        };

        this.PlacementManager = new BannerPlacementManager(ads.Api, ads.Config, this.Api);
        this.PlacementManager.sendBannersReady();

        this.AdUnitFactory = new BannerAdUnitFactory();
        this.CampaignManager = new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, ads.PrivacySDK, ads.PrivacyManager);
        this.AdUnitParametersFactory = new BannerAdUnitParametersFactory(this, ads, core);
        this.BannerAdContextManager = new BannerAdContextManager(core, ads, this);
    }
}
