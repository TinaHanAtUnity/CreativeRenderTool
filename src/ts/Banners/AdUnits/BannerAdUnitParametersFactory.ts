import { ThirdPartyEventMacro, IThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi, ICore } from 'Core/ICore';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IAds } from 'Ads/IAds';
import { IBannerNativeApi, IBannerModule } from 'Banners/IBannerModule';

export class BannerAdUnitParametersFactory {

    private _platform: Platform;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    private _bannerNativeApi: IBannerNativeApi;

    constructor(bannerModule: IBannerModule, ads: IAds, core: ICore) {
        this._platform = core.NativeBridge.getPlatform();
        this._core = core.Api;
        this._clientInfo = core.ClientInfo;
        this._thirdPartyEventManagerFactory = ads.ThirdPartyEventManagerFactory;
        this._programmaticTrackingService = core.ProgrammaticTrackingService;
        this._bannerNativeApi = bannerModule.Api;
    }

    public create(bannerAdViewId: string, campaign: BannerCampaign, placement: Placement, webPlayerContainer: WebPlayerContainer): Promise<IBannerAdUnitParameters> {
        return Promise.resolve({
            platform: this._platform,
            core: this._core,
            campaign: campaign,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: this._thirdPartyEventManagerFactory.create({
                [ThirdPartyEventMacro.ZONE]: placement.getId(),
                [ThirdPartyEventMacro.SDK_VERSION]: this._clientInfo.getSdkVersion().toString()
            }),
            programmaticTrackingService: this._programmaticTrackingService,
            webPlayerContainer: webPlayerContainer,
            bannerNativeApi: this._bannerNativeApi,
            placementId: placement.getId(),
            bannerAdViewId: bannerAdViewId
        });
    }
}
