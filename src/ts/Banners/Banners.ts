import { Ads, AdsModule } from '../Ads/Ads';
import { BannerPlacementManager } from './Managers/BannerPlacementManager';
import { BannerCampaignManager } from './Managers/BannerCampaignManager';
import { BannerWebPlayerContainer } from '../Ads/Utilities/WebPlayer/BannerWebPlayerContainer';
import { BannerAdUnitParametersFactory } from './AdUnits/BannerAdUnitParametersFactory';
import { BannerAdContext } from './Context/BannerAdContext';

export class Banners extends AdsModule {

    public BannerAdContext: BannerAdContext;

    constructor(ads: Ads) {
        super(ads);
    }

    public initialize(): Promise<void> {
        const bannerPlacementManager = new BannerPlacementManager(this._nativeBridge, this._adsConfig);
        bannerPlacementManager.sendBannersReady();

        const bannerCampaignManager = new BannerCampaignManager(this._nativeBridge, this._coreConfig, this._adsConfig, this._assetManager, this._sessionManager, this._adMobSignalFactory, this._request, this._clientInfo, this._deviceInfo, this._metadataManager, this._jaegerManager);
        const bannerWebPlayerContainer = new BannerWebPlayerContainer(this._nativeBridge);
        const bannerAdUnitParametersFactory = new BannerAdUnitParametersFactory(this._nativeBridge, this._request, this._metadataManager, this._coreConfig, this._adsConfig, this._container, this._deviceInfo, this._clientInfo, this._sessionManager, this._focusManager, this._analyticsManager, this._adMobSignalFactory, this._gdprManager, bannerWebPlayerContainer, this._programmaticTrackingService);
        this.BannerAdContext = new BannerAdContext(this._nativeBridge, bannerAdUnitParametersFactory, bannerCampaignManager, bannerPlacementManager, this._focusManager, this._deviceInfo);

    }

}
