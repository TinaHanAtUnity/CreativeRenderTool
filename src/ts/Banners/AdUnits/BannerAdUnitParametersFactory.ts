import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';

export class BannerAdUnitParametersFactory {

    private _platform: Platform;
    private _core: ICoreApi;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _webPlayerContainer: WebPlayerContainer;
    private _metadataManager: MetaDataManager;

    constructor(platform: Platform, core: ICoreApi, request: RequestManager, clientInfo: ClientInfo, webPlayerContainer: WebPlayerContainer, metadataManager: MetaDataManager) {
        this._platform = platform;
        this._core = core;
        this._request = request;
        this._clientInfo = clientInfo;
        this._webPlayerContainer = webPlayerContainer;
        this._metadataManager = metadataManager;
    }

    public create(campaign: BannerCampaign, placement: Placement, options: any): Promise<IBannerAdUnitParameters> {
        return this._metadataManager.fetch(PlayerMetaData, false).then((playerMetadata) => {
            let playerMetadataServerId: string | undefined;
            if (playerMetadata) {
                playerMetadataServerId = playerMetadata.getServerId();
            }
            return {
                platform: this._platform,
                core: this._core,
                placement: placement,
                campaign: campaign,
                clientInfo: this._clientInfo,
                thirdPartyEventManager: new ThirdPartyEventManager(this._core, this._request, [
                    [ThirdPartyEventManager.zoneMacro, placement.getId()],
                    [ThirdPartyEventManager.sdkVersionMacro, this._clientInfo.getSdkVersion().toString()],
                    [ThirdPartyEventManager.gamerSidMacro, playerMetadataServerId || '']
                ]),
                webPlayerContainer: this._webPlayerContainer
            };
        });
    }
}
