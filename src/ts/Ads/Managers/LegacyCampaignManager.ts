import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { CampaignErrorHandlerFactory } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { MediationExperimentType, MediationLoadTrackingManager } from 'Ads/Managers/MediationLoadTrackingManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse, AuctionStatusCode, IRawAuctionResponse, IRawAuctionV5Response } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { ILegacyRequestPrivacy, IRequestPrivacy, RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { Session } from 'Ads/Models/Session';
import { AuctionResponseParser, IParsedAuctionResponse } from 'Ads/Parsers/AuctionResponseParser';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { GameSessionCounters, IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { GeneralTimingMetric, LoadMetric, MiscellaneousMetric, SDKMetrics, ChinaAucionEndpoint } from 'Ads/Utilities/SDKMetrics';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ICore, ICoreApi } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheStatus } from 'Core/Managers/CacheManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AuctionProtocol, INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { CacheError } from 'Core/Native/Cache';
import { BlockingReason, CreativeBlocking } from 'Core/Utilities/CreativeBlocking';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { IStopwatch, createStopwatch } from 'Core/Utilities/Stopwatch';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export interface ILoadedCampaign {
    campaign: Campaign;
    trackingUrls: ICampaignTrackingUrls;
}

export class LegacyCampaignManager extends CampaignManager {
    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _requesting: boolean;
    protected _assetManager: AssetManager;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;
    protected _clientInfo: ClientInfo;
    protected _cacheBookkeeping: CacheBookkeepingManager;
    protected _privacy: PrivacySDK;
    private _contentTypeHandlerManager: ContentTypeHandlerManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _request: RequestManager;
    private _deviceInfo: DeviceInfo;
    private _lastAuctionId: string | undefined;
    private _deviceFreeSpace: number;
    private _auctionProtocol: AuctionProtocol;
    private _isLoadEnabled: boolean = false;
    private _userPrivacyManager: UserPrivacyManager;
    private _mediationLoadTracking: MediationLoadTrackingManager | undefined;
    private _useChinaAuctionEndpoint: boolean | undefined = false;
    private _loadV5Support: boolean | undefined;

    constructor(platform: Platform, core: ICore, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, cacheBookkeeping: CacheBookkeepingManager, contentTypeHandlerManager: ContentTypeHandlerManager, privacySDK: PrivacySDK, userPrivacyManager: UserPrivacyManager, mediationLoadTracking?: MediationLoadTrackingManager | undefined, loadV5Support?: boolean | undefined) {
        super();

        this._platform = platform;
        this._core = core.Api;
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
        this._auctionProtocol = RequestManager.getAuctionProtocol();
        this._privacy = privacySDK;
        this._userPrivacyManager = userPrivacyManager;
        this._mediationLoadTracking = mediationLoadTracking;
        this._useChinaAuctionEndpoint = (coreConfig.getCountry() === 'CN');
        this._loadV5Support = loadV5Support;
    }

    public request(nofillRetry?: boolean): Promise<INativeResponse | void> {
        const requestStartTime = this.getTime();
        let measurement: IStopwatch;
        let chinaMeasurement: IStopwatch;
        this._isLoadEnabled = false;
        // prevent having more then one ad request in flight
        if (this._requesting) {
            return Promise.resolve();
        }

        SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestCreated, {
            'wel': 'false',
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        });

        if (this._mediationLoadTracking) {
            this._mediationLoadTracking.reportAuctionRequestStarted();
        }

        GameSessionCounters.addAdRequest();
        const countersForOperativeEvents = GameSessionCounters.getCurrentCounters();

        const requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
        const legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);

        this._assetManager.enableCaching();
        this._assetManager.checkFreeSpace();

        this._requesting = true;

        SdkStats.setAdRequestTimestamp();
        const requestTimestamp: number = Date.now();

        return Promise.all<string[], number | undefined, number>([
            CampaignManager.getFullyCachedCampaigns(this._core),
            CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
            this._deviceInfo.getFreeSpace()
        ]).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, nofillRetry),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, this._isLoadEnabled, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, nofillRetry, undefined, this._loadV5Support)
            ]);
        }).then(([requestUrl, requestBody]) => {
            this._core.Sdk.logInfo('Requesting ad plan from ' + requestUrl);

            if (this._coreConfig.getCountry() === 'CN') {
                SDKMetrics.reportMetricEventWithTags(ChinaAucionEndpoint.AuctionRequest, {
                    'uce': `${this._useChinaAuctionEndpoint}`
                });
                chinaMeasurement = createStopwatch();
                chinaMeasurement.start();
            }

            measurement = createStopwatch();
            measurement.start();
            return CampaignManager.onlyRequest(this._request, requestUrl, requestBody);
        }).catch((error: unknown) => {
            let reason: string = 'unknown';
            if (error instanceof RequestError) {
                if (error.nativeResponse) {
                    reason = error.nativeResponse.responseCode.toString();
                } else {
                    reason = 'request';
                }
            }
            if (this._mediationLoadTracking && performance && performance.now) {
                this._mediationLoadTracking.reportAuctionRequest(this.getTime() - requestStartTime, false, reason);
            }
            SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestFailed, {
                'wel': 'false',
                'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
                'rsn': reason
            });
            throw error;
        }).then(response => {
            SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestOk, {
                'wel': 'false',
                'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
            });
            measurement.stopAndSend(GeneralTimingMetric.AuctionRequest, {
                'wel': 'false',
                'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
                'stg': 'auction_response'
            });

            if (this._coreConfig.getCountry() === 'CN') {
                chinaMeasurement.stopAndSend(ChinaAucionEndpoint.AuctionResponse, {
                    'uce': `${this._useChinaAuctionEndpoint}`
                });
            }

            const cachingTime = this.getTime();
            if (this._mediationLoadTracking && performance && performance.now) {
                this._mediationLoadTracking.reportAuctionRequest(this.getTime() - requestStartTime, true);
            }
            if (response) {
                this.setSDKSignalValues(requestTimestamp);

                let parseResponse: Promise<void | void[]>;
                switch (this._auctionProtocol) {
                    case AuctionProtocol.V6:
                        parseResponse = this.parseAuctionV6Campaigns(response, countersForOperativeEvents, requestPrivacy, legacyRequestPrivacy);
                        break;
                    case AuctionProtocol.V5:
                        parseResponse = this.parseAuctionV5Campaigns(response, countersForOperativeEvents, requestPrivacy, legacyRequestPrivacy);
                        break;
                    case AuctionProtocol.V4:
                    default:
                        parseResponse = this.parseCampaigns(response, countersForOperativeEvents, requestPrivacy, legacyRequestPrivacy);
                }

                return parseResponse.then(() => {
                    if (this._mediationLoadTracking && performance && performance.now) {
                        this._mediationLoadTracking.reportingAdCaching(this.getTime() - cachingTime, true);
                    }
                }).catch((e) => {
                    if (this._mediationLoadTracking && performance && performance.now) {
                        this._mediationLoadTracking.reportingAdCaching(this.getTime() - cachingTime, false);
                    }
                    this.handleGeneralError(e, 'parse_auction_campaigns_error');
                });
            }
            throw new WebViewError('Empty campaign response', 'CampaignRequestError');
        }).then(() => {
            this._requesting = false;
        }).catch((error) => {
            this._requesting = false;
            if (error instanceof RequestError) {
                if (!error.nativeResponse) {
                    this.onConnectivityError.trigger(this._adsConfig.getPlacementIds());
                    return Promise.resolve();
                }
            }
            return this.handleGeneralError(error, 'auction_request_failed');
        });
    }

    public loadCampaign(placement: Placement): Promise<ILoadedCampaign | undefined> {
        SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestCreated, {
            'wel': 'true',
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        });

        if (this._mediationLoadTracking) {
            this._mediationLoadTracking.reportAuctionRequestStarted();
        }

        const requestStartTime = this.getTime();
        let cachingTime: number;
        this._isLoadEnabled = true;

        // todo: when loading placements individually current logic for enabling and stopping caching might have race conditions
        this._assetManager.enableCaching();

        GameSessionCounters.addAdRequest();
        const countersForOperativeEvents = GameSessionCounters.getCurrentCounters();

        // todo: it appears there are some dependencies to automatic ad request cycle in privacy logic
        const requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
        const legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);

        return Promise.all<string[], number | undefined, number>([
            CampaignManager.getFullyCachedCampaigns(this._core),
            CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
            this._deviceInfo.getFreeSpace()
        ]).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                // TODO: Utilize this.getBaseUrl() after V6 is supported for load
                CampaignManager.createRequestUrl(this.constructBaseUrl(CampaignManager.AuctionV5BaseUrl), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, this._isLoadEnabled, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, placement, this._loadV5Support)
            ]);
        }).then(([requestUrl, requestBody]) => {
            this._core.Sdk.logInfo('Loading placement ' + placement.getId() + ' from ' + requestUrl);
            const body = JSON.stringify(requestBody);
            SDKMetrics.reportMetricEvent(LoadMetric.LoadEnabledAuctionRequest);

            return Promise.resolve().then(() => {
                return this._request.post(requestUrl, body, [], {
                    retries: 0,
                    retryDelay: 0,
                    followRedirects: false,
                    retryWithConnectionEvents: false,
                    timeout: 10000
                }).catch((error: unknown) => {
                    let reason: string = 'unknown';
                    if (error instanceof RequestError) {
                        if (error.nativeResponse) {
                            reason = error.nativeResponse.responseCode.toString();
                        } else {
                            reason = 'request';
                        }
                    }
                    if (this._mediationLoadTracking && performance && performance.now) {
                        this._mediationLoadTracking.reportAuctionRequest(this.getTime() - requestStartTime, false, reason);
                    }
                    SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestFailed, {
                        'wel': 'true',
                        'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
                        'rsn': reason
                    });
                    throw error;
                });
            }).then(response => {
                SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestOk, {
                    'wel': 'true',
                    'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
                });
                cachingTime = this.getTime();
                if (this._mediationLoadTracking && performance && performance.now) {
                    this._mediationLoadTracking.reportAuctionRequest(this.getTime() - requestStartTime, true);
                }

                return this.parseLoadedCampaign(response, placement, countersForOperativeEvents, this._deviceFreeSpace, requestPrivacy, legacyRequestPrivacy);
            }).then((loadedCampaign) => {
                if (loadedCampaign) {
                    SDKMetrics.reportMetricEvent(LoadMetric.LoadEnabledFill);
                    loadedCampaign.campaign.setIsLoadEnabled(true);
                    if (this._mediationLoadTracking && performance && performance.now) {
                        this._mediationLoadTracking.reportingAdCaching(this.getTime() - cachingTime, true);
                    }
                } else {
                    SDKMetrics.reportMetricEvent(LoadMetric.LoadEnabledNoFill);
                    if (this._mediationLoadTracking && performance && performance.now) {
                        this._mediationLoadTracking.reportingAdCaching(this.getTime() - cachingTime, false);
                    }
                }
                return loadedCampaign;
            }).catch(() => {
                Diagnostics.trigger('load_campaign_response_failure', {});
                SDKMetrics.reportMetricEvent(LoadMetric.LoadEnabledNoFill);
                return undefined;
            });
        });
    }

    private getTime(): number {
        if (performance && performance.now) {
            return performance.now();
        }
        return 0;
    }

    private parseCampaigns(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy | undefined, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void[]> {
        let json;
        try {
            json = JsonParser.parse<IRawAuctionResponse>(response.response);
        } catch (e) {
            Diagnostics.trigger('auction_invalid_json', {
                response: response.response
            });
            return Promise.reject(new Error('Could not parse campaign JSON: ' + e.message));
        }

        if (!json.auctionId) {
            throw new Error('No auction ID found');
        } else {
            this._lastAuctionId = json.auctionId;
        }

        const session: Session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        if ('placements' in json) {
            const fill: { [mediaId: string]: AuctionPlacement[] } = {};
            const noFill: string[] = [];

            const placements = this._adsConfig.getPlacements();
            for (const placement in placements) {
                if (placements.hasOwnProperty(placement)) {
                    const mediaId: string = json.placements[placement];

                    if (mediaId) {
                        const auctionPlacement: AuctionPlacement = new AuctionPlacement(placement, mediaId);
                        if (fill[mediaId]) {
                            fill[mediaId].push(auctionPlacement);
                        } else {
                            fill[mediaId] = [auctionPlacement];
                        }
                    } else {
                        noFill.push(placement);
                    }
                }
            }

            let refreshDelay: number = 0;
            const promises: Promise<void>[] = [];

            for (const placement of noFill) {
                promises.push(this.handleNoFill(placement));
                refreshDelay = RefreshManager.NoFillDelayInSeconds;
            }

            let campaigns: number = 0;
            for (const mediaId in fill) {
                if (fill.hasOwnProperty(mediaId)) {
                    campaigns++;

                    const contentType = json.media[mediaId].contentType;
                    const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                    if (contentType && contentType !== 'comet/campaign' && typeof cacheTTL !== 'undefined' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                        refreshDelay = cacheTTL;
                    }
                }
            }

            this._core.Sdk.logInfo('AdPlan received with ' + campaigns + ' campaigns and refreshDelay ' + refreshDelay);
            this.onAdPlanReceived.trigger(refreshDelay, campaigns, auctionStatusCode);

            for (const mediaId in fill) {
                if (fill.hasOwnProperty(mediaId)) {
                    let auctionResponse: AuctionResponse;
                    try {
                        auctionResponse = new AuctionResponse(fill[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
                        promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                            if (error === CacheStatus.STOPPED) {
                                return Promise.resolve();
                            } else if (error === CacheStatus.FAILED) {
                                return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), fill[mediaId], 'campaign_caching_failed', session);
                            } else if (error === CacheError[CacheError.FILE_NOT_FOUND]) {
                                // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                                return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), fill[mediaId], 'campaign_caching_get_file_path_failed', session);
                            }

                            return this.handleParseCampaignError(auctionResponse.getContentType(), error, fill[mediaId], session);
                        }));
                    } catch (error) {
                        this.handlePlacementError(error, fill[mediaId], 'error_creating_handle_campaign_chain', session);
                    }
                }
            }

            return Promise.all(promises);
        } else {
            throw new Error('No placements found');
        }
    }

    private parseAuctionV6Campaigns(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void[]> {
        const promises: Promise<void>[] = [];

        const parsedResponse: IParsedAuctionResponse = AuctionResponseParser.parse(response.response, this._adsConfig.getPlacements());

        this.onAdPlanReceived.trigger(parsedResponse.refreshDelay, parsedResponse.auctionResponses.length, parsedResponse.auctionStatusCode);

        if (this._mediationLoadTracking) {
            this._mediationLoadTracking.reportMediaCount(parsedResponse.auctionResponses.length);
        }

        parsedResponse.unfilledPlacementIds.forEach(placementId => {
            promises.push(this.handleNoFill(placementId));
        });

        const auctionResponses: AuctionResponse[] = parsedResponse.auctionResponses;
        if (auctionResponses.length === 0) {
            return Promise.all(promises);
        }

        const auctionId = parsedResponse.auctionId;
        this._lastAuctionId = auctionId;
        const session: Session = this._sessionManager.create(auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);

        auctionResponses.forEach(auctionResponse => {
            promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                if (error === CacheStatus.STOPPED) {
                    return Promise.resolve();
                } else if (error === CacheStatus.FAILED) {
                    return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), auctionResponse.getPlacements(), 'campaign_caching_failed', session);
                } else if (error === CacheError[CacheError.FILE_NOT_FOUND]) {
                    // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                    return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), auctionResponse.getPlacements(), 'campaign_caching_get_file_path_failed', session);
                }

                return this.handleParseCampaignError(auctionResponse.getContentType(), error, auctionResponse.getPlacements(), session);
            }));
        });

        return Promise.all(promises);
    }

    private parseAuctionV5Campaigns(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void[]> {
        let json;
        try {
            json = JsonParser.parse<IRawAuctionV5Response>(response.response);
        } catch (e) {
            Diagnostics.trigger('invalid_auction_v5_json', {
                response: response.response
            });
            return Promise.reject(new Error('Could not parse campaign JSON: ' + e.message));
        }

        if (!json.auctionId) {
            throw new Error('No auction ID found');
        } else {
            this._lastAuctionId = json.auctionId;
        }

        const session: Session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        if (!('placements' in json)) {
            throw new Error('No placements found');
        }

        const campaigns: { [mediaId: string]: AuctionPlacement[] } = {};
        const noFill: string[] = [];

        const placements = this._adsConfig.getPlacements();
        for (const placement in placements) {
            if (placements.hasOwnProperty(placement)) {
                if (!this._adsConfig.getPlacement(placement).isBannerPlacement()) {
                    let mediaId: string | undefined;

                    if (json.placements.hasOwnProperty(placement)) {
                        if (json.placements[placement].hasOwnProperty('mediaId')) {
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

                    if (mediaId) {
                        let trackingUrls: ICampaignTrackingUrls | undefined;
                        if (json.placements[placement].hasOwnProperty('trackingId')) {
                            const trackingId: string = json.placements[placement].trackingId;
                            if (json.tracking[trackingId]) {
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

                        const auctionPlacement: AuctionPlacement = new AuctionPlacement(placement, mediaId, trackingUrls);

                        if (campaigns[mediaId]) {
                            campaigns[mediaId].push(auctionPlacement);
                        } else {
                            campaigns[mediaId] = [auctionPlacement];
                        }
                    } else {
                        noFill.push(placement);
                    }
                }
            }
        }

        let refreshDelay: number = 0;
        const promises: Promise<void>[] = [];

        for (const placement of noFill) {
            promises.push(this.handleNoFill(placement));
            refreshDelay = RefreshManager.NoFillDelayInSeconds;
        }

        let campaignCount: number = 0;
        for (const mediaId in campaigns) {
            if (campaigns.hasOwnProperty(mediaId)) {
                campaignCount++;

                const contentType = json.media[mediaId].contentType;
                const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                if (contentType && contentType !== 'comet/campaign' && typeof cacheTTL !== 'undefined' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                    refreshDelay = cacheTTL;
                }
            }
        }

        if (this._mediationLoadTracking) {
            this._mediationLoadTracking.reportMediaCount(campaignCount);
        }

        this._core.Sdk.logInfo('AdPlan received with ' + campaignCount + ' campaigns and refreshDelay ' + refreshDelay);
        this.onAdPlanReceived.trigger(refreshDelay, campaignCount, auctionStatusCode);

        for (const mediaId in campaigns) {
            if (campaigns.hasOwnProperty(mediaId)) {
                let auctionResponse: AuctionResponse;
                try {
                    auctionResponse = new AuctionResponse(campaigns[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
                    promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                        if (error === CacheStatus.STOPPED) {
                            return Promise.resolve();
                        } else if (error === CacheStatus.FAILED) {
                            return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), campaigns[mediaId], 'campaign_caching_failed', session);
                        } else if (error === CacheError[CacheError.FILE_NOT_FOUND]) {
                            // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                            return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), campaigns[mediaId], 'campaign_caching_get_file_path_failed', session);
                        }

                        return this.handleParseCampaignError(auctionResponse.getContentType(), error, campaigns[mediaId], session);
                    }));
                } catch (error) {
                    this.handlePlacementError(error, campaigns[mediaId], 'error_creating_auction_v5_handle_campaign_chain', session);
                }
            }
        }

        return Promise.all(promises);
    }

    private parseLoadedCampaign(response: INativeResponse, placement: Placement, gameSessionCounters: IGameSessionCounters, deviceFreeSpace: number, requestPrivacy?: IRequestPrivacy, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<ILoadedCampaign | undefined> {
        let json;
        try {
            // TODO: Transition Load to use Auction V6
            json = JsonParser.parse<IRawAuctionV5Response>(response.response);
        } catch (e) {
            Diagnostics.trigger('load_campaign_failed_to_parse', {});
            return Promise.resolve(undefined);
        }

        const auctionId = json.auctionId;
        if (!auctionId) {
            Diagnostics.trigger('load_campaign_auction_id_missing', {});
            return Promise.resolve(undefined);
        }

        const session: Session = this._sessionManager.create(auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(deviceFreeSpace);

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        if (!('placements' in json)) {
            SessionDiagnostics.trigger('load_campaign_placements_missing_in_json', {}, session);
            return Promise.resolve(undefined);
        }

        const placementId = placement.getId();
        let mediaId: string | undefined;
        let trackingUrls: ICampaignTrackingUrls | undefined;

        if (json.placements.hasOwnProperty(placementId)) {
            if (json.placements[placementId].hasOwnProperty('mediaId')) {
                mediaId = json.placements[placementId].mediaId;
            }

            if (json.placements[placementId].hasOwnProperty('trackingId')) {
                const trackingId: string = json.placements[placementId].trackingId;

                if (json.tracking[trackingId]) {
                    trackingUrls = json.tracking[trackingId];
                }
            }
        }

        if (mediaId && trackingUrls) {
            const auctionPlacement: AuctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);
            const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);

            const parser: CampaignParser = this.getCampaignParser(auctionResponse.getContentType());

            return parser.parse(auctionResponse, session).then((campaign) => {
                if (campaign) {
                    campaign.setMediaId(auctionResponse.getMediaId());

                    return this._assetManager.setup(campaign).then(() => {
                        if (trackingUrls) {
                            return {
                                campaign: campaign,
                                trackingUrls: trackingUrls
                            };
                        } else {
                            SessionDiagnostics.trigger('load_campaign_missing_tracking_urls', {}, campaign.getSession());
                            return undefined;
                        }
                    }).catch(() => {
                        SessionDiagnostics.trigger('load_campaign_failed_caching_setup', {}, campaign.getSession());
                        return undefined;
                    });
                } else {
                    SessionDiagnostics.trigger('load_campaign_undefined_campaign', {}, session);
                    return undefined;
                }
            }).catch(() => {
                SessionDiagnostics.trigger('load_campaign_parse_failure', {
                    creativeID: parser.creativeID,
                    seatID: parser.seatID,
                    campaignID: parser.campaignID
                }, session);
                // TODO: Report to CreativeBlockingService after production testing
                return undefined;
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    private handleCampaign(response: AuctionResponse, session: Session): Promise<void> {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        let parser: CampaignParser;

        if (this._sessionManager.getGameSessionId() % 1000 === 99) {
            SessionDiagnostics.trigger('ad_received', {
                contentType: response.getContentType(),
                seatId: response.getSeatId(),
                creativeId: response.getCreativeId(),
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
        }).catch((error) => {
            this.reportToCreativeBlockingService(error, parser.creativeID, parser.seatID, parser.campaignID);
            throw error;
        }).then((campaign) => {
            const parseDuration = Date.now() - parseTimestamp;
            for (const placement of response.getPlacements()) {
                SdkStats.setParseDuration(placement.getPlacementId(), parseDuration);
            }

            campaign.setMediaId(response.getMediaId());

            return this.setupCampaignAssets(response.getPlacements(), campaign, response.getContentType(), session);
        });
    }

    private reportToCreativeBlockingService(error: unknown, creativeId: string | undefined, seatId: number | undefined, campaignId: string): void {
        let parseErrorPayload = {};

        if (error instanceof CampaignError) {
            parseErrorPayload = {
                parsingFailureReason: error.message,
                vastErrorCode: error.errorCode,
                additionalCampaignErrors: error.getAllCampaignErrors()
            };
        }
        CreativeBlocking.report(creativeId, seatId, campaignId, BlockingReason.VIDEO_PARSE_FAILURE, parseErrorPayload);
    }

    private setupCampaignAssets(placements: AuctionPlacement[], campaign: Campaign, contentType: string, session: Session): Promise<void> {
        const cachingTimestamp = Date.now();
        return this._assetManager.setup(campaign).then(() => {
            for (const placement of placements) {
                this.onCampaign.trigger(placement.getPlacementId(), campaign, placement.getTrackingUrls());
            }

            if (this._sessionManager.getGameSessionId() % 1000 === 99) {
                SessionDiagnostics.trigger('ad_ready', {
                    contentType: contentType,
                    seatId: campaign.getSeatId(),
                    creativeId: campaign.getCreativeId(),
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
                if (resourceUrl) {
                    kafkaObject.url = resourceUrl.getOriginalUrl();
                }

                HttpKafka.sendEvent('ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
            }

            if (campaign instanceof VastCampaign) {
                const campaignWarnings = campaign.getVast().getCampaignErrors();
                const campaignErrorHandler = CampaignErrorHandlerFactory.getCampaignErrorHandler(contentType, this._core, this._request);
                for (const warning of campaignWarnings) {
                    campaignErrorHandler.handleCampaignError(warning);
                }
            }
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

        const testMode = this._coreConfig.getTestMode();

        if (this._auctionProtocol === AuctionProtocol.V6 && testMode) {
            return this.constructBaseUrl(CampaignManager.AuctionV6TestBaseUrl);
        }

        if (testMode) {
            return this.constructBaseUrl(CampaignManager.TestModeUrl);
        }

        switch (this._auctionProtocol) {
            case AuctionProtocol.V6:
                return this.constructBaseUrl(CampaignManager.AuctionV6BaseUrl);
            case AuctionProtocol.V5:
                return this.constructBaseUrl(CampaignManager.AuctionV5BaseUrl);
            case AuctionProtocol.V4:
            default:
                return this.constructBaseUrl(CampaignManager.BaseUrl);
        }
    }

    private constructBaseUrl(baseUri: string): string {
        if (this._useChinaAuctionEndpoint) {
            baseUri = baseUri.replace(/(.*auction\.unityads\.)(unity3d\.com)(.*)/, '$1unity.cn$3');
        }
        return [
            baseUri,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
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
