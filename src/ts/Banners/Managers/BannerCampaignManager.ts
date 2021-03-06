import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AuctionResponse, IAuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { BannerCampaignParserFactory } from 'Banners/Parsers/BannerCampaignParserFactory';
import { BannerAuctionRequest } from 'Banners/Networking/BannerAuctionRequest';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { IBannerDimensions } from 'Banners/Utilities/BannerSizeUtil';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';

export class NoFillError extends Error {
    public response: INativeResponse;
}

export interface IRawBannerResponse {
    auctionId: string;
    correlationId: string;
    placements: { [key: string]: string };
    media: { [key: string]: IAuctionResponse };
}

export interface IRawBannerV5Response {
    auctionId: string;
    correlationId: string;
    placements: { [key: string]: { mediaId: string; trackingId: string } };
    media: { [key: string]: IAuctionResponse };
    tracking: { [key: string]: ICampaignTrackingUrls };
}

export class BannerCampaignManager {
    private _platform: Platform;
    private _core: ICoreApi;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;
    private _clientInfo: ClientInfo;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _request: RequestManager;
    private _deviceInfo: DeviceInfo;
    private _previousPlacementId: string | undefined;
    private _privacySDK: PrivacySDK;
    private _userPrivacyManager: UserPrivacyManager;

    private _promise: Promise<Campaign> | null;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, privacySDK: PrivacySDK, userPrivacyManager: UserPrivacyManager) {
        this._platform = platform;
        this._core = core;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._metaDataManager = metaDataManager;
        this._adMobSignalFactory = adMobSignalFactory;
        this._privacySDK = privacySDK;
        this._userPrivacyManager = userPrivacyManager;
    }

    public request(placement: Placement, bannerSize: IBannerDimensions, nofillRetry?: boolean): Promise<Campaign> {
        GameSessionCounters.addAdRequest();
        const request = new BannerAuctionRequest({
            platform: this._platform,
            core: this._core,
            adMobSignalFactory: this._adMobSignalFactory,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            clientInfo: this._clientInfo,
            deviceInfo: this._deviceInfo,
            metaDataManager: this._metaDataManager,
            request: this._request,
            sessionManager: this._sessionManager,
            bannerSize: bannerSize,
            privacySDK: this._privacySDK,
            userPrivacyManager: this._userPrivacyManager
        });
        request.addPlacement(placement);
        request.setTimeout(3000);

        return request.request()
            .then((response) => {
                const nativeResponse = request.getNativeResponse();
                if (nativeResponse) {
                    switch (RequestManager.getAuctionProtocol()) {
                        case AuctionProtocol.V4:
                            return this.parseBannerCampaign(nativeResponse, placement);
                        case AuctionProtocol.V5:
                        default:
                            return this.parseAuctionV5BannerCampaign(nativeResponse, placement);
                    }
                }
                throw new Error('Empty campaign response');
            })
            .catch((e) => {
                return this.handleError(e, 'banner_auction_request_failed');
            })
            .then((campaign) => {
                return campaign;
            });
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    private handleError(e: Error, diagnostic: string): Promise<Campaign> {
        return Promise.reject(e);
    }

    private parseBannerCampaign(response: INativeResponse, placement: Placement): Promise<Campaign> {
        const json = JsonParser.parse<IRawBannerResponse>(response.response);
        const session = new Session(json.auctionId);

        if ('placements' in json) {
            const mediaId: string = json.placements[placement.getId()];

            if (mediaId) {
                const auctionPlacement = new AuctionPlacement(placement.getId(), mediaId);
                const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId);
                return this.handleBannerCampaign(auctionResponse, session);
            } else {
                const e = new NoFillError(`No fill for placement ${placement.getId()}`);
                e.response = response;
                return Promise.reject(e);
            }
        } else {
            const e = new Error('No placements found');
            this._core.Sdk.logError(e.message);
            return Promise.reject(e);
        }
    }

    private parseAuctionV5BannerCampaign(response: INativeResponse, placement: Placement): Promise<Campaign> {
        const json = JsonParser.parse<IRawBannerV5Response>(response.response);
        const session = new Session(json.auctionId);

        if ('placements' in json) {
            const placementId = placement.getId();
            if (placement.isBannerPlacement()) {
                let mediaId: string | undefined;
                if (json.placements.hasOwnProperty(placementId)) {
                    if (json.placements[placementId].hasOwnProperty('mediaId')) {
                        mediaId = json.placements[placementId].mediaId;
                    } else {
                        SessionDiagnostics.trigger('missing_auction_v5_banner_mediaid', {
                            placementId: placement
                        }, session);
                    }
                } else {
                    SessionDiagnostics.trigger('missing_auction_v5_banner_placement', {
                        placementId: placement
                    }, session);
                }

                if (mediaId) {
                    let trackingUrls: ICampaignTrackingUrls = {};
                    if (json.placements[placementId].hasOwnProperty('trackingId')) {
                        const trackingId: string = json.placements[placementId].trackingId;
                        if (json.tracking[trackingId]) {
                            trackingUrls = json.tracking[trackingId];
                        } else {
                            SessionDiagnostics.trigger('invalid_auction_v5_banner_tracking_id', {
                                mediaId: mediaId,
                                trackingId: trackingId
                            }, session);
                            throw new Error('Invalid tracking ID ' + trackingId);
                        }
                    } else {
                        SessionDiagnostics.trigger('missing_auction_v5_banner_tracking_id', {
                            mediaId: mediaId
                        }, session);
                        throw new Error('Missing tracking ID');
                    }

                    const auctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);
                    const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId);
                    return this.handleV5BannerCampaign(auctionResponse, session, trackingUrls);
                } else {
                    const e = new NoFillError(`No fill for placement ${placementId}`);
                    this._core.Sdk.logError(e.message);
                    return Promise.reject(e);
                }
            } else {
                const e = new Error(`Placement ${placementId} is not a banner placement`);
                this._core.Sdk.logError(e.message);
                return Promise.reject(e);
            }
        } else {
            const e = new Error('No placements found in V5 campaign json.');
            this._core.Sdk.logError(e.message);
            return Promise.reject(e);
        }
    }

    private handleV5BannerCampaign(response: AuctionResponse, session: Session, trackingUrls: ICampaignTrackingUrls): Promise<Campaign> {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());

        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        return parser.parse(response, session).then((campaign) => {
            campaign.setMediaId(response.getMediaId());
            campaign.setTrackingUrls(trackingUrls);
            return campaign;
        });
    }

    private handleBannerCampaign(response: AuctionResponse, session: Session): Promise<Campaign> {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());

        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        return parser.parse(response, session).then((campaign) => {
            campaign.setMediaId(response.getMediaId());
            return campaign;
        });
    }

    private getCampaignParser(contentType: string): CampaignParser {
        return BannerCampaignParserFactory.getCampaignParser(this._platform, contentType);
    }
}
