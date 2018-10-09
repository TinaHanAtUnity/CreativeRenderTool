import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { BannerCampaignParserFactory } from 'Banners/Parsers/BannerCampaignParserFactory';
import { BannerAuctionRequest } from 'Banners/Utilities/BannerAuctionRequest';
import { Platform } from 'Core/Constants/Platform';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/Core';

export class BannerCampaignManager {
    private _platform: Platform;
    private _core: ICoreApi;
    private _assetManager: AssetManager;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;
    private _clientInfo: ClientInfo;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _request: RequestManager;
    private _deviceInfo: DeviceInfo;
    private _previousPlacementId: string | undefined;
    private _jaegerManager: JaegerManager;

    private _promise: Promise<Campaign> | null;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, jaegerManager: JaegerManager) {
        this._platform = platform;
        this._core = core;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._assetManager = assetManager;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._metaDataManager = metaDataManager;
        this._adMobSignalFactory = adMobSignalFactory;
        this._jaegerManager = jaegerManager;
    }

    public request(placement: Placement, nofillRetry?: boolean): Promise<Campaign> {
        // prevent having more then one ad request in flight
        if (this._promise) {
            return this._promise;
        }

        GameSessionCounters.addAdRequest();

        const jaegerSpan = this._jaegerManager.startSpan('BannerCampaignManagerRequest');
        jaegerSpan.addTag(JaegerTags.DeviceType, Platform[this._platform]);

        const request = BannerAuctionRequest.create({
            platform: this._platform,
            core: this._core,
            adMobSignalFactory: this._adMobSignalFactory,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            clientInfo: this._clientInfo,
            deviceInfo: this._deviceInfo,
            metaDataManager: this._metaDataManager,
            request: this._request,
            sessionManager: this._sessionManager
        });
        request.addPlacement(placement);
        request.setTimeout(3000);

        this._promise = request.request()
            .then((response) => {
                this._promise = null;
                const nativeResponse = request.getNativeResponse();
                if (nativeResponse) {
                    if (nativeResponse.responseCode) {
                        jaegerSpan.addTag(JaegerTags.StatusCode, nativeResponse.responseCode.toString());
                    }
                    return this.parseBannerCampaign(nativeResponse, placement);
                }
                throw new Error('Empty campaign response');
            })
            .catch((e) => {
                this._promise = null;
                return this.handleError(e, 'banner_auction_request_failed');
            })
            .then((campaign) => {
                this._jaegerManager.stop(jaegerSpan);
                return campaign;
            })
            .catch((e) => {
                jaegerSpan.addTag(JaegerTags.Error, 'true');
                jaegerSpan.addTag(JaegerTags.ErrorMessage, e.message);
                jaegerSpan.addAnnotation(e.message);
                this._jaegerManager.stop(jaegerSpan);
                throw e;
            });

        return this._promise;
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    private handleError(e: Error, diagnostic: string) {
        Diagnostics.trigger(diagnostic, e);
        return Promise.reject(e);
    }

    private parseBannerCampaign(response: INativeResponse, placement: Placement): Promise<Campaign> {
        const json = JsonParser.parse(response.response);
        const session = new Session(json.auctionId);

        if('placements' in json) {
            const mediaId: string = json.placements[placement.getId()];

            if(mediaId) {
                const auctionResponse = new AuctionResponse([placement.getId()], json.media[mediaId], mediaId, json.correlationId);
                return this.handleBannerCampaign(auctionResponse, session);
            } else {
                return Promise.reject(`No fill for placement ${placement.getId()}`);
            }
        } else {
            const e = new Error('No placements found in realtime campaign json.');
            this._core.Sdk.logError(e.message);
            return Promise.reject(e);
        }
    }

    private handleBannerCampaign(response: AuctionResponse, session: Session): Promise<Campaign> {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());

        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        return parser.parse(this._platform, this._core, this._request, response, session, this._deviceInfo.getOsVersion()).then((campaign) => {
            campaign.setMediaId(response.getMediaId());
            return campaign;
        });
    }

    private getCampaignParser(contentType: string): CampaignParser {
        return BannerCampaignParserFactory.getCampaignParser(contentType);
    }

    private getAbGroup() {
        return this._coreConfig.getAbGroup();
    }
}
