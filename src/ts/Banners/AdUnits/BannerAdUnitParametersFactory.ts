import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';

export class BannerAdUnitParametersFactory {

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _webPlayerContainer: WebPlayerContainer;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, webPlayerContainer: WebPlayerContainer) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._webPlayerContainer = webPlayerContainer;
    }

    public create(campaign: BannerCampaign, placement: Placement, options: any): Promise<IBannerAdUnitParameters> {
        return Promise.resolve({
            placement,
            campaign,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: new ThirdPartyEventManager(this._nativeBridge, this._request, {
                '%ZONE%': placement.getId(),
                '%SDK_VERSION%': this._clientInfo.getSdkVersion().toString()
            }),
            webPlayerContainer: this._webPlayerContainer
        });
    }
}
