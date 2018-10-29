import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { IBannerAdUnitParameters } from './BannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';

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
