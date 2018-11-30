import { ThirdPartyEventMacro, IThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';

export class BannerAdUnitParametersFactory {

    private _platform: Platform;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _webPlayerContainer: WebPlayerContainer;
    private _thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, webPlayerContainer: WebPlayerContainer, thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory) {
        this._platform = platform;
        this._core = core;
        this._clientInfo = clientInfo;
        this._webPlayerContainer = webPlayerContainer;
        this._thirdPartyEventManagerFactory = thirdPartyEventManagerFactory;
    }

    public create(campaign: BannerCampaign, placement: Placement, options: any): Promise<IBannerAdUnitParameters> {
        return Promise.resolve({
            platform: this._platform,
            core: this._core,
            placement: placement,
            campaign: campaign,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: this._thirdPartyEventManagerFactory.create({
                [ThirdPartyEventMacro.ZONE]: placement.getId(),
                [ThirdPartyEventMacro.SDK_VERSION]: this._clientInfo.getSdkVersion().toString()
            }),
            webPlayerContainer: this._webPlayerContainer
        });
    }
}
