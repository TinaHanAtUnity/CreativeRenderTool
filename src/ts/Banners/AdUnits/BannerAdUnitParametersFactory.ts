import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';

export class BannerAdUnitParametersFactory {

    private _platform: Platform;
    private _core: ICoreApi;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _webPlayerContainer: WebPlayerContainer;

    constructor(platform: Platform, core: ICoreApi, request: RequestManager, clientInfo: ClientInfo, webPlayerContainer: WebPlayerContainer) {
        this._platform = platform;
        this._core = core;
        this._request = request;
        this._clientInfo = clientInfo;
        this._webPlayerContainer = webPlayerContainer;
    }

    public create(campaign: BannerCampaign, placement: Placement, options: unknown): Promise<IBannerAdUnitParameters> {
        return Promise.resolve({
            platform: this._platform,
            core: this._core,
            placement,
            campaign,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: new ThirdPartyEventManager(this._core, this._request, {
                '%ZONE%': placement.getId(),
                '%SDK_VERSION%': this._clientInfo.getSdkVersion().toString()
            }),
            webPlayerContainer: this._webPlayerContainer
        });
    }
}
