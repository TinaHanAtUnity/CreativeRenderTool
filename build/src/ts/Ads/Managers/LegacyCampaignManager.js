import { CampaignError } from 'Ads/Errors/CampaignError';
import { CampaignErrorHandlerFactory } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse, AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { AuctionResponseParser } from 'Ads/Parsers/AuctionResponseParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { GeneralTimingMetric, LoadMetric, MiscellaneousMetric, SDKMetrics, ChinaAucionEndpoint } from 'Ads/Utilities/SDKMetrics';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { RequestError } from 'Core/Errors/RequestError';
import { WebViewError } from 'Core/Errors/WebViewError';
import { CacheStatus } from 'Core/Managers/CacheManager';
import { AuctionProtocol, RequestManager } from 'Core/Managers/RequestManager';
import { CacheError } from 'Core/Native/Cache';
import { BlockingReason, CreativeBlocking } from 'Core/Utilities/CreativeBlocking';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
export class LegacyCampaignManager extends CampaignManager {
    constructor(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, mediationLoadTracking, loadV5Support) {
        super();
        this._isLoadEnabled = false;
        this._useChinaAuctionEndpoint = false;
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
    request(nofillRetry) {
        const requestStartTime = this.getTime();
        let measurement;
        let chinaMeasurement;
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
        const requestTimestamp = Date.now();
        return Promise.all([
            CampaignManager.getFullyCachedCampaigns(this._core),
            CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
            this._deviceInfo.getFreeSpace()
        ]).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all([
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
        }).catch((error) => {
            let reason = 'unknown';
            if (error instanceof RequestError) {
                if (error.nativeResponse) {
                    reason = error.nativeResponse.responseCode.toString();
                }
                else {
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
                let parseResponse;
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
    loadCampaign(placement) {
        SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.AuctionRequestCreated, {
            'wel': 'true',
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        });
        if (this._mediationLoadTracking) {
            this._mediationLoadTracking.reportAuctionRequestStarted();
        }
        const requestStartTime = this.getTime();
        let cachingTime;
        this._isLoadEnabled = true;
        // todo: when loading placements individually current logic for enabling and stopping caching might have race conditions
        this._assetManager.enableCaching();
        GameSessionCounters.addAdRequest();
        const countersForOperativeEvents = GameSessionCounters.getCurrentCounters();
        // todo: it appears there are some dependencies to automatic ad request cycle in privacy logic
        const requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
        const legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);
        return Promise.all([
            CampaignManager.getFullyCachedCampaigns(this._core),
            CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
            this._deviceInfo.getFreeSpace()
        ]).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all([
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
                }).catch((error) => {
                    let reason = 'unknown';
                    if (error instanceof RequestError) {
                        if (error.nativeResponse) {
                            reason = error.nativeResponse.responseCode.toString();
                        }
                        else {
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
                }
                else {
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
    getTime() {
        if (performance && performance.now) {
            return performance.now();
        }
        return 0;
    }
    parseCampaigns(response, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            Diagnostics.trigger('auction_invalid_json', {
                response: response.response
            });
            return Promise.reject(new Error('Could not parse campaign JSON: ' + e.message));
        }
        if (!json.auctionId) {
            throw new Error('No auction ID found');
        }
        else {
            this._lastAuctionId = json.auctionId;
        }
        const session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if ('placements' in json) {
            const fill = {};
            const noFill = [];
            const placements = this._adsConfig.getPlacements();
            for (const placement in placements) {
                if (placements.hasOwnProperty(placement)) {
                    const mediaId = json.placements[placement];
                    if (mediaId) {
                        const auctionPlacement = new AuctionPlacement(placement, mediaId);
                        if (fill[mediaId]) {
                            fill[mediaId].push(auctionPlacement);
                        }
                        else {
                            fill[mediaId] = [auctionPlacement];
                        }
                    }
                    else {
                        noFill.push(placement);
                    }
                }
            }
            let refreshDelay = 0;
            const promises = [];
            for (const placement of noFill) {
                promises.push(this.handleNoFill(placement));
                refreshDelay = RefreshManager.NoFillDelayInSeconds;
            }
            let campaigns = 0;
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
                    let auctionResponse;
                    try {
                        auctionResponse = new AuctionResponse(fill[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
                        promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                            if (error === CacheStatus.STOPPED) {
                                return Promise.resolve();
                            }
                            else if (error === CacheStatus.FAILED) {
                                return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), fill[mediaId], 'campaign_caching_failed', session);
                            }
                            else if (error === CacheError[CacheError.FILE_NOT_FOUND]) {
                                // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                                return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), fill[mediaId], 'campaign_caching_get_file_path_failed', session);
                            }
                            return this.handleParseCampaignError(auctionResponse.getContentType(), error, fill[mediaId], session);
                        }));
                    }
                    catch (error) {
                        this.handlePlacementError(error, fill[mediaId], 'error_creating_handle_campaign_chain', session);
                    }
                }
            }
            return Promise.all(promises);
        }
        else {
            throw new Error('No placements found');
        }
    }
    parseAuctionV6Campaigns(response, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        const promises = [];
        const parsedResponse = AuctionResponseParser.parse(response.response, this._adsConfig.getPlacements());
        this.onAdPlanReceived.trigger(parsedResponse.refreshDelay, parsedResponse.auctionResponses.length, parsedResponse.auctionStatusCode);
        if (this._mediationLoadTracking) {
            this._mediationLoadTracking.reportMediaCount(parsedResponse.auctionResponses.length);
        }
        parsedResponse.unfilledPlacementIds.forEach(placementId => {
            promises.push(this.handleNoFill(placementId));
        });
        const auctionResponses = parsedResponse.auctionResponses;
        if (auctionResponses.length === 0) {
            return Promise.all(promises);
        }
        const auctionId = parsedResponse.auctionId;
        this._lastAuctionId = auctionId;
        const session = this._sessionManager.create(auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);
        auctionResponses.forEach(auctionResponse => {
            promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                if (error === CacheStatus.STOPPED) {
                    return Promise.resolve();
                }
                else if (error === CacheStatus.FAILED) {
                    return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), auctionResponse.getPlacements(), 'campaign_caching_failed', session);
                }
                else if (error === CacheError[CacheError.FILE_NOT_FOUND]) {
                    // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                    return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), auctionResponse.getPlacements(), 'campaign_caching_get_file_path_failed', session);
                }
                return this.handleParseCampaignError(auctionResponse.getContentType(), error, auctionResponse.getPlacements(), session);
            }));
        });
        return Promise.all(promises);
    }
    parseAuctionV5Campaigns(response, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            Diagnostics.trigger('invalid_auction_v5_json', {
                response: response.response
            });
            return Promise.reject(new Error('Could not parse campaign JSON: ' + e.message));
        }
        if (!json.auctionId) {
            throw new Error('No auction ID found');
        }
        else {
            this._lastAuctionId = json.auctionId;
        }
        const session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(this._deviceFreeSpace);
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if (!('placements' in json)) {
            throw new Error('No placements found');
        }
        const campaigns = {};
        const noFill = [];
        const placements = this._adsConfig.getPlacements();
        for (const placement in placements) {
            if (placements.hasOwnProperty(placement)) {
                if (!this._adsConfig.getPlacement(placement).isBannerPlacement()) {
                    let mediaId;
                    if (json.placements.hasOwnProperty(placement)) {
                        if (json.placements[placement].hasOwnProperty('mediaId')) {
                            mediaId = json.placements[placement].mediaId;
                        }
                        else {
                            SessionDiagnostics.trigger('missing_auction_v5_mediaid', {
                                placementId: placement
                            }, session);
                        }
                    }
                    else {
                        SessionDiagnostics.trigger('missing_auction_v5_placement', {
                            placementId: placement
                        }, session);
                    }
                    if (mediaId) {
                        let trackingUrls;
                        if (json.placements[placement].hasOwnProperty('trackingId')) {
                            const trackingId = json.placements[placement].trackingId;
                            if (json.tracking[trackingId]) {
                                trackingUrls = json.tracking[trackingId];
                            }
                            else {
                                SessionDiagnostics.trigger('invalid_auction_v5_tracking_id', {
                                    mediaId: mediaId,
                                    trackingId: trackingId
                                }, session);
                                throw new Error('Invalid tracking ID ' + trackingId);
                            }
                        }
                        else {
                            SessionDiagnostics.trigger('missing_auction_v5_tracking_id', {
                                mediaId: mediaId
                            }, session);
                            throw new Error('Missing tracking ID');
                        }
                        const auctionPlacement = new AuctionPlacement(placement, mediaId, trackingUrls);
                        if (campaigns[mediaId]) {
                            campaigns[mediaId].push(auctionPlacement);
                        }
                        else {
                            campaigns[mediaId] = [auctionPlacement];
                        }
                    }
                    else {
                        noFill.push(placement);
                    }
                }
            }
        }
        let refreshDelay = 0;
        const promises = [];
        for (const placement of noFill) {
            promises.push(this.handleNoFill(placement));
            refreshDelay = RefreshManager.NoFillDelayInSeconds;
        }
        let campaignCount = 0;
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
                let auctionResponse;
                try {
                    auctionResponse = new AuctionResponse(campaigns[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
                    promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                        if (error === CacheStatus.STOPPED) {
                            return Promise.resolve();
                        }
                        else if (error === CacheStatus.FAILED) {
                            return this.handlePlacementError(new WebViewError('Caching failed', 'CacheStatusFailed'), campaigns[mediaId], 'campaign_caching_failed', session);
                        }
                        else if (error === CacheError[CacheError.FILE_NOT_FOUND]) {
                            // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                            return this.handlePlacementError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), campaigns[mediaId], 'campaign_caching_get_file_path_failed', session);
                        }
                        return this.handleParseCampaignError(auctionResponse.getContentType(), error, campaigns[mediaId], session);
                    }));
                }
                catch (error) {
                    this.handlePlacementError(error, campaigns[mediaId], 'error_creating_auction_v5_handle_campaign_chain', session);
                }
            }
        }
        return Promise.all(promises);
    }
    parseLoadedCampaign(response, placement, gameSessionCounters, deviceFreeSpace, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            // TODO: Transition Load to use Auction V6
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            Diagnostics.trigger('load_campaign_failed_to_parse', {});
            return Promise.resolve(undefined);
        }
        const auctionId = json.auctionId;
        if (!auctionId) {
            Diagnostics.trigger('load_campaign_auction_id_missing', {});
            return Promise.resolve(undefined);
        }
        const session = this._sessionManager.create(auctionId);
        session.setAdPlan(response.response);
        session.setGameSessionCounters(gameSessionCounters);
        session.setPrivacy(requestPrivacy);
        session.setLegacyPrivacy(legacyRequestPrivacy);
        session.setDeviceFreeSpace(deviceFreeSpace);
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if (!('placements' in json)) {
            SessionDiagnostics.trigger('load_campaign_placements_missing_in_json', {}, session);
            return Promise.resolve(undefined);
        }
        const placementId = placement.getId();
        let mediaId;
        let trackingUrls;
        if (json.placements.hasOwnProperty(placementId)) {
            if (json.placements[placementId].hasOwnProperty('mediaId')) {
                mediaId = json.placements[placementId].mediaId;
            }
            if (json.placements[placementId].hasOwnProperty('trackingId')) {
                const trackingId = json.placements[placementId].trackingId;
                if (json.tracking[trackingId]) {
                    trackingUrls = json.tracking[trackingId];
                }
            }
        }
        if (mediaId && trackingUrls) {
            const auctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);
            const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode);
            const parser = this.getCampaignParser(auctionResponse.getContentType());
            return parser.parse(auctionResponse, session).then((campaign) => {
                if (campaign) {
                    campaign.setMediaId(auctionResponse.getMediaId());
                    return this._assetManager.setup(campaign).then(() => {
                        if (trackingUrls) {
                            return {
                                campaign: campaign,
                                trackingUrls: trackingUrls
                            };
                        }
                        else {
                            SessionDiagnostics.trigger('load_campaign_missing_tracking_urls', {}, campaign.getSession());
                            return undefined;
                        }
                    }).catch(() => {
                        SessionDiagnostics.trigger('load_campaign_failed_caching_setup', {}, campaign.getSession());
                        return undefined;
                    });
                }
                else {
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
        }
        else {
            return Promise.resolve(undefined);
        }
    }
    handleCampaign(response, session) {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        let parser;
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
        }
        catch (e) {
            return Promise.reject(e);
        }
        const parseTimestamp = Date.now();
        return parser.parse(response, session).catch((error) => {
            if (error instanceof CampaignError && error.contentType === CampaignContentTypes.ProgrammaticVast && error.errorCode === ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD) {
                parser = this.getCampaignParser(CampaignContentTypes.ProgrammaticVpaid);
                return parser.parse(response, session);
            }
            else {
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
    reportToCreativeBlockingService(error, creativeId, seatId, campaignId) {
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
    setupCampaignAssets(placements, campaign, contentType, session) {
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
                const kafkaObject = {};
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
    getCampaignParser(contentType) {
        return this._contentTypeHandlerManager.getParser(contentType);
    }
    handleNoFill(placement) {
        this._core.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onNoFill.trigger(placement);
        return Promise.resolve();
    }
    handleGeneralError(error, diagnosticsType, session) {
        return this.handleError(error, this._adsConfig.getPlacementIds(), diagnosticsType, session);
    }
    handlePlacementError(error, placements, diagnosticsType, session) {
        return this.handleError(error, placements.map(placement => placement.getPlacementId()), diagnosticsType, session);
    }
    handleError(error, placementIds, diagnosticsType, session) {
        this._core.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error, placementIds, diagnosticsType, session);
        return Promise.resolve();
    }
    handleParseCampaignError(contentType, campaignError, placements, session) {
        const campaignErrorHandler = CampaignErrorHandlerFactory.getCampaignErrorHandler(contentType, this._core, this._request);
        campaignErrorHandler.handleCampaignError(campaignError);
        return this.handlePlacementError(campaignError, placements, `parse_campaign_${contentType.replace(/[\/-]/g, '_')}_error`, session);
    }
    getBaseUrl() {
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
    constructBaseUrl(baseUri) {
        if (this._useChinaAuctionEndpoint) {
            baseUri = baseUri.replace(/(.*auction\.unityads\.)(unity3d\.com)(.*)/, '$1unity.cn$3');
        }
        return [
            baseUri,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }
    setSDKSignalValues(requestTimestamp) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVnYWN5Q2FtcGFpZ25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9MZWdhY3lDYW1wYWlnbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3pELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXJGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUcvRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBOEMsTUFBTSw0QkFBNEIsQ0FBQztBQUc1SCxPQUFPLEVBQTBDLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFMUcsT0FBTyxFQUFFLHFCQUFxQixFQUEwQixNQUFNLG1DQUFtQyxDQUFDO0FBRWxHLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBd0IsTUFBTSxtQ0FBbUMsQ0FBQztBQUM5RixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pJLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFNUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxZQUFZ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