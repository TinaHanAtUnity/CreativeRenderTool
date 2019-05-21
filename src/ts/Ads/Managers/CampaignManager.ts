import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AuctionResponse, IRawAuctionResponse, IRawAuctionV5Response, IRawRealtimeResponse, AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { GameSessionCounters, IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ICoreApi } from 'Core/ICore';
import { JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheStatus } from 'Core/Managers/CacheManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { CacheError } from 'Core/Native/Cache';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Observable1, Observable2, Observable3, Observable4 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { CampaignErrorHandlerFactory } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { INativeResponse, RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { CreativeBlocking, BlockingReason } from 'Core/Utilities/CreativeBlocking';
import { IRequestPrivacy, RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';

export class CampaignManager {

    public static setCampaignId(campaignId: string) {
        CampaignManager.CampaignId = campaignId;
    }

    public static setSessionId(sessionId: string) {
        CampaignManager.SessionId = sessionId;
    }

    public static setCountry(country: string) {
        CampaignManager.Country = country;
    }

    public static setCampaignResponse(campaignResponse: string) {
        CampaignManager.CampaignResponse = campaignResponse;
    }

    public static setBaseUrl(baseUrl: string): void {
        CampaignManager.BaseUrl = baseUrl + '/v4/games';
        CampaignManager.AuctionV5BaseUrl = baseUrl + '/v5/games';
    }

    protected static CampaignResponse: string | undefined;

    protected static AbGroup: ABGroup | undefined;

    private static BaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';
    private static AuctionV5BaseUrl: string = 'https://auction.unityads.unity3d.com/v5/games';
    private static TestModeUrl: string = 'https://auction.unityads.unity3d.com/v4/test/games';

    private static CampaignId: string | undefined;
    private static SessionId: string | undefined;
    private static Country: string | undefined;

    public readonly onCampaign = new Observable3<string, Campaign, ICampaignTrackingUrls | undefined>();
    public readonly onNoFill = new Observable1<string>();
    public readonly onError = new Observable4<unknown, string[], string, Session | undefined>();
    public readonly onConnectivityError = new Observable1<string[]>();
    public readonly onAdPlanReceived = new Observable3<number, number, number>();

    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _requesting: boolean;
    protected _assetManager: AssetManager;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;
    protected _clientInfo: ClientInfo;
    protected _cacheBookkeeping: CacheBookkeepingManager;
    private _contentTypeHandlerManager: ContentTypeHandlerManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _backupCampaignManager: BackupCampaignManager;
    private _request: RequestManager;
    private _deviceInfo: DeviceInfo;
    private _deviceConnectionType: string | undefined;
    private _previousPlacementId: string | undefined;
    private _realtimeUrl: string | undefined;
    private _realtimeBody?: { [key: string]: unknown } = {};
    private _jaegerManager: JaegerManager;
    private _lastAuctionId: string | undefined;
    private _deviceFreeSpace: number;
    private _auctionProtocol: AuctionProtocol;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, cacheBookkeeping: CacheBookkeepingManager, contentTypeHandlerManager: ContentTypeHandlerManager, jaegerManager: JaegerManager, backupCampaignManager: BackupCampaignManager) {
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
        this._cacheBookkeeping = cacheBookkeeping;
        this._contentTypeHandlerManager = contentTypeHandlerManager;
        this._requesting = false;
        this._jaegerManager = jaegerManager;
        this._backupCampaignManager = backupCampaignManager;
        this._auctionProtocol = RequestManager.getAuctionProtocol();
    }

    public request(nofillRetry?: boolean): Promise<INativeResponse | void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        GameSessionCounters.addAdRequest();
        const countersForOperativeEvents = GameSessionCounters.getCurrentCounters();
        const requestPrivacy = RequestPrivacyFactory.create(this._adsConfig.getUserPrivacy(), this._adsConfig.getGamePrivacy());

        this._assetManager.enableCaching();
        this._assetManager.checkFreeSpace();

        this._requesting = true;

        this.resetRealtimeDataForPlacements();
        const jaegerSpan = this._jaegerManager.startSpan('CampaignManagerRequest');
        jaegerSpan.addTag(JaegerTags.DeviceType, Platform[this._platform]);
        return Promise.all([this.createRequestUrl(false, nofillRetry), this.createRequestBody(requestPrivacy, countersForOperativeEvents, nofillRetry)]).then(([requestUrl, requestBody]) => {
            this._core.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            const body = JSON.stringify(requestBody);

            SdkStats.setAdRequestTimestamp();
            const requestTimestamp: number = Date.now();
            return Promise.resolve().then((): Promise<INativeResponse> => {
                if(CampaignManager.CampaignResponse) {
                    return Promise.resolve({
                        url: requestUrl,
                        response: CampaignManager.CampaignResponse,
                        responseCode: 200,
                        headers: []
                    });
                }
                const headers: [string, string][] = [];
                if (this._jaegerManager.isJaegerTracingEnabled()) {
                    headers.push(this._jaegerManager.getTraceId(jaegerSpan));
                }
                return this._request.post(requestUrl, body, headers, {
                    retries: 2,
                    retryDelay: 10000,
                    followRedirects: false,
                    retryWithConnectionEvents: false
                });
            }).then(response => {
                if (response && response.responseCode) {
                    jaegerSpan.addTag(JaegerTags.StatusCode, response.responseCode.toString());
                }
                if (response) {
                    this.setSDKSignalValues(requestTimestamp);

                    if(this._auctionProtocol === AuctionProtocol.V5) {
                        return this.parseAuctionV5Campaigns(response, countersForOperativeEvents, requestPrivacy).catch((e) => {
                            this.handleGeneralError(e, 'parse_auction_v5_campaigns_error');
                        });
                    } else {
                        return this.parseCampaigns(response, countersForOperativeEvents, requestPrivacy).catch((e) => {
                            this.handleGeneralError(e, 'parse_campaigns_error');
                        });
                    }
                }
                throw new WebViewError('Empty campaign response', 'CampaignRequestError');
            }).then(() => {
                this._requesting = false;
            }).catch((error) => {
                this._requesting = false;
                if(error instanceof RequestError) {
                    if(!error.nativeResponse) {
                        this.onConnectivityError.trigger(this._adsConfig.getPlacementIds());
                        return Promise.resolve();
                    }
                }
                return this.handleGeneralError(error, 'auction_request_failed');
            });
        }).then((resp) => {
            this._jaegerManager.stop(jaegerSpan);
            return resp;
        }).catch((error) => {
            jaegerSpan.addTag(JaegerTags.Error, 'true');
            jaegerSpan.addTag(JaegerTags.ErrorMessage, error.message);
            jaegerSpan.addAnnotation(error.message);
            this._jaegerManager.stop(jaegerSpan);
            throw new Error(error);
        });
    }

    public requestRealtime(placement: Placement, session: Session): Promise<Campaign | void> {
        return Promise.all([this.createRequestUrl(true, undefined, session), this.createRequestBody(session.getPrivacy(), session.getGameSessionCounters(), false, placement)]).then(([requestUrl, requestBody]) => {
            this._core.Sdk.logInfo('Requesting realtime ad plan from ' + requestUrl);
            const body = JSON.stringify(requestBody);
            return this._request.post(requestUrl, body, [], {
                retries: 0,
                retryDelay: 0,
                followRedirects: false,
                retryWithConnectionEvents: false,
                timeout: 2000
            }).then(response => {
                if(response) {
                    return this.parseRealtimeCampaign(response, session, placement);
                }
                throw new WebViewError('Empty realtime campaign response', 'CampaignRequestError');
            });
        });
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    public getFullyCachedCampaigns(): Promise<string[]> {
        return this._core.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }

    public resetRealtimeDataForPlacements() {
        const placements = this._adsConfig.getPlacements();
        Object.keys(placements).forEach((placementId) => {
            placements[placementId].setRealtimeData(undefined);
        });
    }

    private parseCampaigns(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy: IRequestPrivacy): Promise<void[]> {
        let json;
        try {
            json = JsonParser.parse<IRawAuctionResponse>(response.response);
        } catch (e) {
            Diagnostics.trigger('auction_invalid_json', {
                response: response.response
            });
            return Promise.reject(new Error('Could not parse campaign JSON: ' + e.message));
        }

        if(!json.auctionId) {
            throw new Error('No auction ID found');
        } else {
            this._lastAuctionId = json.auctionId;
        }

        const session: Session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        this._backupCampaignManager.deleteBackupCampaigns();
        this._cacheBookkeeping.deleteCachedCampaignResponse(); // todo: legacy backup campaign cleanup, remove in early 2019

        if('placements' in json) {
            const fill: { [mediaId: string]: AuctionPlacement[] } = {};
            const noFill: string[] = [];

            const placements = this._adsConfig.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    const mediaId: string = json.placements[placement];

                    if(mediaId) {
                        const auctionPlacement: AuctionPlacement = new AuctionPlacement(placement, mediaId);
                        if(fill[mediaId]) {
                            fill[mediaId].push(auctionPlacement);
                        } else {
                            fill[mediaId] = [auctionPlacement];
                        }

                        this._backupCampaignManager.storePlacement(this._adsConfig.getPlacement(placement), mediaId);
                    } else {
                        noFill.push(placement);
                    }

                    if(json.realtimeData && json.realtimeData[placement]) {
                        this._adsConfig.getPlacement(placement).setRealtimeData(json.realtimeData[placement]);
                    }
                }
            }

            let refreshDelay: number = 0;
            const promises: Promise<void>[] = [];

            for(const placement of noFill) {
                promises.push(this.handleNoFill(placement));
                refreshDelay = RefreshManager.NoFillDelayInSeconds;
            }

            let campaigns: number = 0;
            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    campaigns++;

                    const contentType = json.media[mediaId].contentType;
                    const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                    if(contentType && contentType !== 'comet/campaign' && typeof cacheTTL !== 'undefined' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                        refreshDelay = cacheTTL;
                    }
                }
            }

            this._core.Sdk.logInfo('AdPlan received with ' + campaigns + ' campaigns and refreshDelay ' + refreshDelay);
            this.onAdPlanReceived.trigger(refreshDelay, campaigns, auctionStatusCode);

            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    let auctionResponse: AuctionResponse;
                    try {
                        auctionResponse = new AuctionResponse(fill[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
                        promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                            if(error === CacheStatus.STOPPED) {
                                return Promise.resolve();
                            } else if(error === CacheStatus.FAILED) {
                                return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), fill[mediaId], 'campaign_caching_failed', session);
                            } else if(error === CacheError[CacheError.FILE_NOT_FOUND]) {
                                // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                                return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), fill[mediaId], 'campaign_caching_get_file_path_failed', session);
                            }

                            return this.handleParseCampaignError(auctionResponse.getContentType(), error, fill[mediaId], session);
                        }));
                    } catch(error) {
                        this.handlePlacementError(error, fill[mediaId], 'error_creating_handle_campaign_chain', session);
                    }
                }
            }

            return Promise.all(promises);
        } else {
            throw new Error('No placements found');
        }
    }

    private parseAuctionV5Campaigns(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy: IRequestPrivacy): Promise<void[]> {
        let json;
        try {
            json = JsonParser.parse<IRawAuctionV5Response>(response.response);
        } catch (e) {
            Diagnostics.trigger('invalid_auction_v5_json', {
                response: response.response
            });
            return Promise.reject(new Error('Could not parse campaign JSON: ' + e.message));
        }

        if(!json.auctionId) {
            throw new Error('No auction ID found');
        } else {
            this._lastAuctionId = json.auctionId;
        }

        const session: Session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        this._backupCampaignManager.deleteBackupCampaigns();
        this._cacheBookkeeping.deleteCachedCampaignResponse(); // todo: legacy backup campaign cleanup, remove in early 2019

        if(!('placements' in json)) {
            throw new Error('No placements found');
        }

        const campaigns: { [mediaId: string]: AuctionPlacement[] } = {};
        const noFill: string[] = [];

        const placements = this._adsConfig.getPlacements();
        for(const placement in placements) {
            if(placements.hasOwnProperty(placement)) {
                if(!this._adsConfig.getPlacement(placement).isBannerPlacement()) {
                    let mediaId: string | undefined;

                    if(json.placements.hasOwnProperty(placement)) {
                        if(json.placements[placement].hasOwnProperty('mediaId')) {
                            mediaId = json.placements[placement].mediaId;
                        } else {
                            SessionDiagnostics.trigger('missing_auction_v5_mediaid', {
                                placementId: placement
                            }, session);
                        }
                    } else {
                        SessionDiagnostics.trigger('missing_auction_v5_placement', {
                            placementId: placement
                        }, session);
                    }

                    if(mediaId) {
                        let trackingUrls: ICampaignTrackingUrls | undefined;
                        if(json.placements[placement].hasOwnProperty('trackingId')) {
                            const trackingId: string = json.placements[placement].trackingId;
                            if(json.tracking[trackingId]) {
                                trackingUrls = json.tracking[trackingId];
                            } else {
                                SessionDiagnostics.trigger('invalid_auction_v5_tracking_id', {
                                    mediaId: mediaId,
                                    trackingId: trackingId
                                }, session);
                                throw new Error('Invalid tracking ID ' + trackingId);
                            }
                        } else {
                            SessionDiagnostics.trigger('missing_auction_v5_tracking_id', {
                                mediaId: mediaId
                            }, session);
                            throw new Error('Missing tracking ID');
                        }

                        this._backupCampaignManager.storePlacement(this._adsConfig.getPlacement(placement), mediaId, trackingUrls);

                        const auctionPlacement: AuctionPlacement = new AuctionPlacement(placement, mediaId, trackingUrls);

                        if(campaigns[mediaId]) {
                            campaigns[mediaId].push(auctionPlacement);
                        } else {
                            campaigns[mediaId] = [auctionPlacement];
                        }
                    } else {
                        noFill.push(placement);
                    }

                    if(json.realtimeData && json.realtimeData[placement]) {
                        this._adsConfig.getPlacement(placement).setRealtimeData(json.realtimeData[placement]);
                    }
                }
            }
        }

        let refreshDelay: number = 0;
        const promises: Promise<void>[] = [];

        for(const placement of noFill) {
            promises.push(this.handleNoFill(placement));
            refreshDelay = RefreshManager.NoFillDelayInSeconds;
        }

        let campaignCount: number = 0;
        for(const mediaId in campaigns) {
            if(campaigns.hasOwnProperty(mediaId)) {
                campaignCount++;

                const contentType = json.media[mediaId].contentType;
                const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                if(contentType && contentType !== 'comet/campaign' && typeof cacheTTL !== 'undefined' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                    refreshDelay = cacheTTL;
                }
            }
        }

        this._core.Sdk.logInfo('AdPlan received with ' + campaignCount + ' campaigns and refreshDelay ' + refreshDelay);
        this.onAdPlanReceived.trigger(refreshDelay, campaignCount, auctionStatusCode);

        for(const mediaId in campaigns) {
            if(campaigns.hasOwnProperty(mediaId)) {
                let auctionResponse: AuctionResponse;
                try {
                    auctionResponse = new AuctionResponse(campaigns[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
                    promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                        if(error === CacheStatus.STOPPED) {
                            return Promise.resolve();
                        } else if(error === CacheStatus.FAILED) {
                            return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), campaigns[mediaId], 'campaign_caching_failed', session);
                        } else if(error === CacheError[CacheError.FILE_NOT_FOUND]) {
                            // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                            return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), campaigns[mediaId], 'campaign_caching_get_file_path_failed', session);
                        }

                        return this.handleParseCampaignError(auctionResponse.getContentType(), error, campaigns[mediaId], session);
                    }));
                } catch(error) {
                    this.handlePlacementError(error, campaigns[mediaId], 'error_creating_auction_v5_handle_campaign_chain', session);
                }
            }
        }

        return Promise.all(promises);
    }

    private parseRealtimeCampaign(response: INativeResponse, session: Session, placement: Placement): Promise<Campaign | void> {
        const json = JsonParser.parse<IRawRealtimeResponse>(response.response);

        if('placements' in json) {
            const mediaId: string = json.placements[placement.getId()];

            if(mediaId) {
                const oldCampaign = placement.getCurrentCampaign();

                if(oldCampaign && oldCampaign.getMediaId() === mediaId) {
                    return Promise.resolve(oldCampaign);
                }

                const auctionPlacement: AuctionPlacement = new AuctionPlacement(placement.getId(), mediaId);
                const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId);

                return this.handleRealtimeCampaign(auctionResponse, session);
            } else {
                return Promise.resolve(); // no fill
            }
        } else {
            this._core.Sdk.logError('No placements found in realtime campaign json.');
            return Promise.resolve();
        }
    }

    private handleCampaign(response: AuctionResponse, session: Session): Promise<void> {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        let parser: CampaignParser;

        if(this._sessionManager.getGameSessionId() % 1000 === 99) {
            SessionDiagnostics.trigger('ad_received', {
                contentType: response.getContentType(),
                auctionProtocol: this._auctionProtocol,
                abGroup: this._coreConfig.getAbGroup().valueOf()
            }, session);
        }

        try {
            parser = this.getCampaignParser(response.getContentType());
            parser.setCreativeIdentification(response);
        } catch (e) {
            return Promise.reject(e);
        }

        const parseTimestamp = Date.now();
        return parser.parse(response, session).catch((error) => {
            if (error instanceof CampaignError && error.contentType === CampaignContentTypes.ProgrammaticVast && error.errorCode === ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD) {
                parser = this.getCampaignParser(CampaignContentTypes.ProgrammaticVpaid);
                return parser.parse(response, session);
            } else {
                throw error;
            }
        }).then((campaign) => {
            const parseDuration = Date.now() - parseTimestamp;
            for(const placement of response.getPlacements()) {
                SdkStats.setParseDuration(placement.getPlacementId(), parseDuration);
            }

            campaign.setMediaId(response.getMediaId());

            return this.setupCampaignAssets(response.getPlacements(), campaign, response.getContentType(), session);
        }).catch((error) => {
            CreativeBlocking.report(parser.creativeID, parser.seatID, parser.campaignID, BlockingReason.VIDEO_PARSE_FAILURE, {
                errorCode: error.errorCode || undefined,
                message: error.message || undefined
            });
            throw error;
        });
    }

    private setupCampaignAssets(placements: AuctionPlacement[], campaign: Campaign, contentType: string, session: Session): Promise<void> {
        const cachingTimestamp = Date.now();
        return this._assetManager.setup(campaign).then(() => {
            if(this._sessionManager.getGameSessionId() % 1000 === 99) {
                SessionDiagnostics.trigger('ad_ready', {
                    contentType: contentType,
                    auctionProtocol: this._auctionProtocol,
                    abGroup: this._coreConfig.getAbGroup().valueOf()
                }, session);
            }

            if (campaign instanceof PerformanceMRAIDCampaign) {
                const cachingDuration = Date.now() - cachingTimestamp;

                const kafkaObject: { [key: string]: unknown } = {};
                kafkaObject.type = 'playable_caching_time';
                kafkaObject.eventData = {
                    contentType: contentType
                };
                kafkaObject.timeFromShow = cachingDuration / 1000;
                kafkaObject.timeFromPlayableStart = 0;
                kafkaObject.backgroundTime = 0;
                kafkaObject.auctionId = campaign.getSession().getId();

                const resourceUrl = campaign.getResourceUrl();
                if(resourceUrl) {
                    kafkaObject.url = resourceUrl.getOriginalUrl();
                }

                HttpKafka.sendEvent('ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
            }

            for(const placement of placements) {
                this.onCampaign.trigger(placement.getPlacementId(), campaign, placement.getTrackingUrls());
            }
        });
    }

    private handleRealtimeCampaign(response: AuctionResponse, session: Session): Promise<Campaign> {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());

        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        return parser.parse(response, session).then((campaign) => {
            campaign.setMediaId(response.getMediaId());

            return campaign;
        });
    }

    private getCampaignParser(contentType: string): CampaignParser {
        return this._contentTypeHandlerManager.getParser(contentType);
    }

    private handleNoFill(placement: string): Promise<void> {
        this._core.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onNoFill.trigger(placement);
        return Promise.resolve();
    }

    private handleGeneralError(error: unknown, diagnosticsType: string, session?: Session): Promise<void> {
        return this.handleError(error, this._adsConfig.getPlacementIds(), diagnosticsType, session);
    }

    private handlePlacementError(error: unknown, placements: AuctionPlacement[], diagnosticsType: string, session?: Session): Promise<void> {
        return this.handleError(error, placements.map(placement => placement.getPlacementId()), diagnosticsType, session);
    }

    private handleError(error: unknown, placementIds: string[], diagnosticsType: string, session?: Session): Promise<void> {
        this._core.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error, placementIds, diagnosticsType, session);
        return Promise.resolve();
    }

    private handleParseCampaignError(contentType: string, campaignError: CampaignError, placements: AuctionPlacement[], session?: Session): Promise<void> {
        const campaignErrorHandler = CampaignErrorHandlerFactory.getCampaignErrorHandler(contentType, this._core, this._request);
        campaignErrorHandler.handleCampaignError(campaignError);
        return this.handlePlacementError(campaignError, placements, `parse_campaign_${contentType.replace(/[\/-]/g, '_')}_error`, session);
    }

    private getBaseUrl(): string {
        if(this._coreConfig.getTestMode()) {
            return [
                CampaignManager.TestModeUrl,
                this._clientInfo.getGameId(),
                'requests'
            ].join('/');
        }
        if(this._auctionProtocol === AuctionProtocol.V5) {
            return [
                CampaignManager.AuctionV5BaseUrl,
                this._clientInfo.getGameId(),
                'requests'
            ].join('/');
        } else {
            return [
                CampaignManager.BaseUrl,
                this._clientInfo.getGameId(),
                'requests'
            ].join('/');
        }
    }

    private createRequestUrl(realtime: boolean, nofillRetry?: boolean, session?: Session): Promise<string> {

        if (realtime && this._realtimeUrl) {
            if (session) {
                this._realtimeUrl = Url.addParameters(this._realtimeUrl, {
                    auctionId: session.getId()
                });
            }
            return Promise.resolve(this._realtimeUrl);
        }
        this._realtimeUrl = undefined;

        let url: string = this.getBaseUrl();

        const trackingIDs = TrackingIdentifierFilter.getDeviceTrackingIdentifiers(this._platform, this._clientInfo.getSdkVersionName(), this._deviceInfo);

        if (this._coreConfig.getCountry() === 'CN' && this._platform === Platform.ANDROID && this._sessionManager.getGameSessionId() % 10 === 0) {
            Diagnostics.trigger('china_ifa_request', {
                advertisingTrackingId: trackingIDs.advertisingTrackingId ? trackingIDs.advertisingTrackingId : 'no-info',
                limitAdTracking: trackingIDs.limitAdTracking ? trackingIDs.limitAdTracking : 'no-info',
                androidId: trackingIDs.androidId ? trackingIDs.androidId : 'no-info',
                imei: trackingIDs.imei ? trackingIDs.imei : 'no-info'
            });
        }

        url = Url.addParameters(url, trackingIDs);

        if (nofillRetry && this._lastAuctionId) {
            url = Url.addParameters(url, {
                auctionId: this._lastAuctionId
            });
        }

        url = Url.addParameters(url, {
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._platform].toLowerCase(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            stores: this._deviceInfo.getStores()
        });

        if(this._platform === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
            url = Url.addParameters(url, {
                osVersion: this._deviceInfo.getOsVersion(),
                screenScale: this._deviceInfo.getScreenScale()
            });
        } else if(this._platform === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                deviceMake: this._deviceInfo.getManufacturer(),
                screenSize:  this._deviceInfo.getScreenLayout(),
                screenDensity: this._deviceInfo.getScreenDensity(),
                apiLevel: this._deviceInfo.getApiLevel()
            });
        }

        if(this._coreConfig.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        if(CampaignManager.CampaignId) {
            url = Url.addParameters(url, {
                forceCampaignId: CampaignManager.CampaignId
            });
        }

        if(CampaignManager.SessionId) {
            url = Url.addParameters(url, {
                forceSessionId: CampaignManager.SessionId
            });
        }

        if(CampaignManager.AbGroup) {
            url = Url.addParameters(url, {
                forceAbGroup: CampaignManager.AbGroup
            });
        }

        if(CampaignManager.Country) {
            url = Url.addParameters(url, {
                force_country: CampaignManager.Country
            });
        }

        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._deviceInfo.getConnectionType(),
            this._deviceInfo.getNetworkType()
        ]).then(([screenWidth, screenHeight, connectionType, networkType]) => {
            url = Url.addParameters(url, {
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                connectionType: connectionType,
                networkType: networkType
            });
            this._deviceConnectionType = connectionType;
            this._realtimeUrl = url;
            return url;
        });
    }

    private createRequestBody(requestPrivacy: IRequestPrivacy, gameSessionCounters: IGameSessionCounters, nofillRetry?: boolean, realtimePlacement?: Placement): Promise<unknown> {
        const placementRequest: { [key: string]: unknown } = {};

        if(realtimePlacement && this._realtimeBody) {

            const placements = this._adsConfig.getPlacements();
            for (const placement in placements) {
                if (placements.hasOwnProperty(placement)) {
                    placementRequest[placement] = {
                        adTypes: placements[placement].getAdTypes(),
                        allowSkip: placements[placement].allowSkip()
                    };
                }
            }

            if(realtimePlacement.getRealtimeData()) {
                const realtimeDataObject: { [key: string]: string | undefined } = {};
                realtimeDataObject[realtimePlacement.getId()] = realtimePlacement.getRealtimeData();
                this._realtimeBody.realtimeData = realtimeDataObject;
            }

            return this._deviceInfo.getFreeSpace().then((freeSpace) => {
                if(this._realtimeBody) {
                    this._realtimeBody.deviceFreeSpace = freeSpace;
                }
                return this._realtimeBody;
            }).catch((e) => {
                // Try the request with the original request value anyways
                return this._realtimeBody;
            });
        }
        this._realtimeBody = undefined;

        const body: { [key: string]: unknown } = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            coppa: this._coreConfig.isCoppaCompliant(),
            language: this._deviceInfo.getLanguage(),
            gameSessionId: this._sessionManager.getGameSessionId(),
            timeZone: this._deviceInfo.getTimeZone(),
            simulator: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
            token: this._coreConfig.getToken()
        };

        if (this.getPreviousPlacementId()) {
            body.previousPlacementId = this.getPreviousPlacementId();
        }

        if(typeof navigator !== 'undefined' && navigator.userAgent && typeof navigator.userAgent === 'string') {
            body.webviewUa = navigator.userAgent;
        }

        if(nofillRetry) {
            body.nofillRetry = true;
        }

        return Promise.all([
            this._deviceInfo.getFreeSpace(),
            this._deviceInfo.getNetworkOperator(),
            this._deviceInfo.getNetworkOperatorName(),
            this._deviceInfo.getHeadset(),
            this._deviceInfo.getDeviceVolume(),
            this.getFullyCachedCampaigns(),
            this.getVersionCode(),
            this._adMobSignalFactory.getAdRequestSignal().then(signal => {
                return signal.getBase64ProtoBufNonEncoded();
            }),
            this._adMobSignalFactory.getOptionalSignal().then(signal => {
                return signal.getDTO();
            })
        ]).then(([freeSpace, networkOperator, networkOperatorName, headset, volume, fullyCachedCampaignIds, versionCode, requestSignal, optionalSignal]) => {
            this._deviceFreeSpace = freeSpace; // save device free space for this session
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;
            body.wiredHeadset = headset;
            body.volume = volume;
            body.requestSignal = requestSignal;
            body.ext = optionalSignal;
            body.isPromoCatalogAvailable = PurchasingUtilities.isCatalogAvailable();

            if(fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) {
                body.cachedCampaigns = fullyCachedCampaignIds;
            }

            if(versionCode) {
                body.versionCode = versionCode;
            }

            return Promise.all([
                this._metaDataManager.fetch(MediationMetaData),
                this._metaDataManager.fetch(FrameworkMetaData)
            ]).then(([mediation, framework]) => {
                if(mediation) {
                    body.mediationName = mediation.getName();
                    body.mediationVersion = mediation.getVersion();
                    if(mediation.getOrdinal()) {
                        body.mediationOrdinal = mediation.getOrdinal();
                    }
                }

                if(framework) {
                    body.frameworkName = framework.getName();
                    body.frameworkVersion = framework.getVersion();
                }

                const placements = this._adsConfig.getPlacements();

                Object.keys(placements).forEach((placementId) => {
                    const placement = placements[placementId];
                    if (!placement.isBannerPlacement()) {
                        placementRequest[placementId] = {
                            adTypes: placement.getAdTypes(),
                            allowSkip: placement.allowSkip(),
                            auctionType: placement.getAuctionType()
                        };
                    }
                });
                body.placements = placementRequest;
                body.properties = this._coreConfig.getProperties();
                body.sessionDepth = SdkStats.getAdRequestOrdinal();
                body.projectId = this._coreConfig.getUnityProjectId();
                body.gameSessionCounters = gameSessionCounters;
                body.gdprEnabled = this._adsConfig.isGDPREnabled();
                body.optOutEnabled = this._adsConfig.isOptOutEnabled();
                body.optOutRecorded = this._adsConfig.isOptOutRecorded();
                body.privacy = requestPrivacy;
                body.abGroup = this._coreConfig.getAbGroup();

                const organizationId = this._coreConfig.getOrganizationId();
                if(organizationId) {
                    body.organizationId = organizationId;
                }
                this._realtimeBody = body;
                return body;
            });
        });
    }

    private getVersionCode(): Promise<number | undefined> {
        if(this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.Android!.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                if(packageInfo.versionCode) {
                    return packageInfo.versionCode;
                } else {
                    return undefined;
                }
            }).catch(() => {
                return undefined;
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    private setSDKSignalValues(requestTimestamp: number): void {
        SdkStats.setAdRequestDuration(Date.now() - requestTimestamp);
        SdkStats.increaseAdRequestOrdinal();

        UserCountData.getRequestCount(this._core).then((requestCount) => {
            if (typeof requestCount === 'number') {
                UserCountData.setRequestCount(requestCount + 1, this._core);
            }
        }).catch(() => {
            Diagnostics.trigger('request_count_failure', {
                signal: 'requestCount'
            });
        });
    }
}
