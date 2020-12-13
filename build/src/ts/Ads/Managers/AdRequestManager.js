import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { AuctionStatusCode, AuctionResponse } from 'Ads/Models/AuctionResponse';
import { SDKMetrics, LoadV5 } from 'Ads/Utilities/SDKMetrics';
import { RequestError } from 'Core/Errors/RequestError';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Observable2 } from 'Core/Utilities/Observable';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';
export class AdRequestManagerError extends Error {
    constructor(message, tag) {
        super(message);
        this.tag = tag;
    }
}
export var LoadV5ExperimentType;
(function (LoadV5ExperimentType) {
    LoadV5ExperimentType["None"] = "none";
    LoadV5ExperimentType["NoInvalidation"] = "no_invalidation";
})(LoadV5ExperimentType || (LoadV5ExperimentType = {}));
export class AdRequestManager extends CampaignManager {
    constructor(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, experiment) {
        super();
        this.onAdditionalPlacementsReady = new Observable2();
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
        this._privacy = privacySDK;
        this._userPrivacyManager = userPrivacyManager;
        this._ongoingReloadRequest = null;
        this._ongoingLoadRequests = {};
        this._reloadResults = {};
        this._preloadData = null;
        this._encryptedPreloadData = {};
        this._preloadFailed = false;
        this._ongoingPreloadRequest = new Promise((resolve) => { this._ongoingPreloadRequestResolve = resolve; });
        this._activePreload = false;
        this._currentExperiment = experiment;
    }
    requestPreload() {
        // _ongoingPreloadRequest is used to trigger scheduled load requests
        // after preload request finished
        if (this._ongoingPreloadRequest === null) {
            this._ongoingPreloadRequest = new Promise((resolve) => { this._ongoingPreloadRequestResolve = resolve; });
        }
        if (this._activePreload) {
            this.reportMetricEvent(LoadV5.PreloadRequestAlreadyActive);
            let promiseResolve;
            const promise = new Promise((resolve) => { promiseResolve = resolve; });
            this._ongoingPreloadRequest = this._ongoingPreloadRequest.then(() => { promiseResolve(); });
            return promise;
        }
        let countersForOperativeEvents;
        let requestPrivacy;
        let legacyRequestPrivacy;
        this.reportMetricEvent(LoadV5.PreloadRequestStarted);
        this._preloadData = null;
        this._currentSession = null;
        this._preloadFailed = false;
        this._activePreload = true;
        return Promise.resolve().then(() => {
            GameSessionCounters.addAdRequest();
            countersForOperativeEvents = GameSessionCounters.getCurrentCounters();
            requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
            legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);
            return Promise.all([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()
            ]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, undefined, true)
            ]);
        }).then(([requestUrl, requestBody]) => this._request.post(requestUrl, JSON.stringify(this.makePreloadBody(requestBody)), [], {
            retries: 3,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false,
            timeout: 5000
        })).then((response) => {
            if (response) {
                SdkStats.increaseAdRequestOrdinal();
            }
            this.reportMetricEvent(LoadV5.PreloadRequestParsingResponse);
            return this.parsePreloadResponse(response, countersForOperativeEvents, requestPrivacy, legacyRequestPrivacy);
        }).catch((err) => {
            this._preloadFailed = true;
            this.handleError(LoadV5.PreloadRequestFailed, err);
        }).then(() => {
            this._activePreload = false;
            this._ongoingPreloadRequest = null;
            this._ongoingPreloadRequestResolve();
        });
    }
    requestLoad(placementId, additionalPlacements = [], rescheduled = false) {
        // setting that placementId is being loaded,
        // this is used to track load cancellation due to reload request
        this._ongoingLoadRequests[placementId] = true;
        // schedule load request after preload
        if (this._ongoingPreloadRequest !== null) {
            let promiseResolve;
            const promise = new Promise((resolve) => { promiseResolve = resolve; }).then(() => this.requestLoad(placementId, additionalPlacements, true));
            this._ongoingPreloadRequest = this._ongoingPreloadRequest.then(() => { promiseResolve(); });
            return promise;
        }
        // schedule load request after reload
        if (this._ongoingReloadRequest !== null) {
            let promiseResolve;
            const promise = new Promise((resolve) => { promiseResolve = resolve; }).then(() => this.requestLoad(placementId, additionalPlacements, true));
            this._ongoingReloadRequest = this._ongoingReloadRequest.then(() => { promiseResolve(); });
            return promise;
        }
        let requestPrivacy;
        let legacyRequestPrivacy;
        if (this._frequencyCapTimestamp !== undefined) {
            if (Date.now() > this._frequencyCapTimestamp) {
                this._frequencyCapTimestamp = undefined;
            }
        }
        if (this._frequencyCapTimestamp !== undefined) {
            this.reportMetricEvent(LoadV5.LoadRequestFrequencyCap);
            return Promise.resolve(undefined);
        }
        this.reportMetricEvent(LoadV5.LoadRequestStarted, { 'src': 'default' });
        return Promise.resolve().then(() => {
            if (this.hasPreloadFailed()) {
                if (rescheduled) {
                    throw new AdRequestManagerError('Preload data is missing due to failure to receive it after load request was rescheduled', 'rescheduled_failed_preload');
                }
                throw new AdRequestManagerError('Preload data is missing due to failure to receive it', 'failed_preload');
            }
            if (this.isPreloadDataExpired()) {
                throw new AdRequestManagerError('Preload data expired', 'expired');
            }
            if (this._currentSession === null) {
                throw new AdRequestManagerError('Session is not set', 'no_session');
            }
            requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
            legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);
            this._assetManager.enableCaching();
            this._assetManager.checkFreeSpace();
            return Promise.all([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()
            ]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, undefined, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, this._adsConfig.getPlacement(placementId), true)
            ]);
        }).then(([requestUrl, requestBody]) => this._request.post(requestUrl, JSON.stringify(this.makeLoadBody(requestBody, placementId, additionalPlacements)), [], {
            retries: 3,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false,
            timeout: 5000
        })).then((response) => {
            // if load request has been canceled by reload request, we start it again or we use result from reload request
            if (this._ongoingLoadRequests[placementId] === undefined) {
                if (this._reloadResults[placementId] !== undefined) {
                    return Promise.resolve(this._reloadResults[placementId]);
                }
                this.reportMetricEvent(LoadV5.LoadRequestWasCanceled);
                return this.requestLoad(placementId);
            }
            this.reportMetricEvent(LoadV5.LoadRequestParsingResponse, { 'src': 'default' });
            return this.parseLoadResponse(response, this._adsConfig.getPlacement(placementId), additionalPlacements);
        }).then((campaign) => {
            delete this._ongoingLoadRequests[placementId];
            if (campaign) {
                this.reportMetricEvent(LoadV5.LoadRequestFill);
            }
            return campaign;
        }).catch((err) => {
            delete this._ongoingLoadRequests[placementId];
            this.handleError(LoadV5.LoadRequestFailed, err, { 'src': 'default' });
            return undefined;
        });
    }
    requestReload(placementsToLoad) {
        if (this._ongoingReloadRequest !== null) {
            return Promise.resolve();
        }
        let countersForOperativeEvents;
        let requestPrivacy;
        let legacyRequestPrivacy;
        this.reportMetricEvent(LoadV5.ReloadRequestStarted);
        let promiseResolve;
        this._ongoingReloadRequest = new Promise((resolve) => { promiseResolve = resolve; });
        this._ongoingLoadRequests = {}; // cancel all ongoing load requests
        this._reloadResults = {};
        this._preloadFailed = false;
        this._preloadData = null;
        this._currentSession = null;
        return Promise.resolve().then(() => {
            GameSessionCounters.addAdRequest();
            countersForOperativeEvents = GameSessionCounters.getCurrentCounters();
            requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
            legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);
            this._assetManager.enableCaching();
            this._assetManager.checkFreeSpace();
            return Promise.all([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()
            ]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, undefined, true)
            ]);
        }).then(([requestUrl, requestBody]) => this._request.post(requestUrl, JSON.stringify(this.makeReloadBody(requestBody, placementsToLoad.map((placementId) => this._adsConfig.getPlacement(placementId)))), [], {
            retries: 3,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false,
            timeout: 5000
        })).then((response) => {
            if (response) {
                SdkStats.increaseAdRequestOrdinal();
            }
            this.reportMetricEvent(LoadV5.ReloadRequestParsingResponse);
            return this.parseReloadResponse(response, placementsToLoad.map((placementId) => this._adsConfig.getPlacement(placementId)), countersForOperativeEvents, requestPrivacy, legacyRequestPrivacy);
        }).catch((err) => {
            this._preloadFailed = true;
            placementsToLoad.forEach((placementId) => this.onNoFill.trigger(placementId));
            this.handleError(LoadV5.ReloadRequestFailed, err);
        }).then(() => {
            this._ongoingReloadRequest = null;
            promiseResolve();
        });
    }
    request(nofillRetry) {
        return this.requestPreload();
    }
    loadCampaignWithAdditionalPlacement(placement) {
        let additionalPlacements = [];
        if (placement.hasGroupId()) {
            additionalPlacements = this._adsConfig.getPlacementsForGroupId(placement.getGroupId())
                .filter(placementId => placementId !== placement.getId());
        }
        return this.requestLoad(placement.getId(), additionalPlacements);
    }
    loadCampaign(placement) {
        return this.requestLoad(placement.getId(), []);
    }
    isPreloadDataExpired() {
        return this._preloadData !== null && Date.now() > this._preloadDataExpireAt;
    }
    hasPreloadFailed() {
        return this._preloadFailed;
    }
    getBaseUrl() {
        return [
            AdRequestManager.LoadV5BaseUrl,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }
    parsePreloadResponse(response, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }
        if (!json.auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction ID found', 'auction_id'));
        }
        else {
            this._lastAuctionId = json.auctionId;
        }
        this._preloadData = this.parsePreloadData(json);
        this.updatePreloadDataExpiration();
        this._currentSession = this._sessionManager.create(json.auctionId);
        this._currentSession.setGameSessionCounters(gameSessionCounters);
        this._currentSession.setPrivacy(requestPrivacy);
        this._currentSession.setLegacyPrivacy(legacyRequestPrivacy);
        this._currentSession.setDeviceFreeSpace(this._deviceFreeSpace);
        return Promise.resolve();
    }
    parseLoadResponse(response, placement, additionalPlacements) {
        // time
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }
        const auctionId = json.auctionId;
        if (!auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction id', 'auction_id'));
        }
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if (auctionStatusCode === AuctionStatusCode.FREQUENCY_CAP_REACHED) {
            const nowInMilliSec = Date.now();
            this._frequencyCapTimestamp = nowInMilliSec + TimeUtils.getNextUTCDayDeltaSeconds(nowInMilliSec) * 1000;
            return Promise.reject(new AdRequestManagerError('Frequency cap reached first', 'frequency_cap_first'));
        }
        if (!('placements' in json)) {
            return Promise.reject(new AdRequestManagerError('No placement', 'no_plc'));
        }
        const allPlacements = [
            placement,
            ...additionalPlacements.map((x) => this._adsConfig.getPlacement(x))
        ];
        return this.parseAllPlacements(json, allPlacements, auctionStatusCode, LoadV5.LoadRequestParseCampaignFailed).then((loadedCampaigns) => {
            const additionalCampaigns = additionalPlacements.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[currentValue] = loadedCampaigns[currentValue];
                return previousValue;
            }, {});
            this.onAdditionalPlacementsReady.trigger(placement.getGroupId(), additionalCampaigns);
            return loadedCampaigns[placement.getId()];
        }).then((notCachedLoadedCampaign) => this.cacheCampaign(notCachedLoadedCampaign));
    }
    parsePreloadData(response) {
        if (!response.preloadData) {
            return null;
        }
        const preloadData = {};
        this._encryptedPreloadData = response.encryptedPreloadData;
        for (const placementPreloadData in response.preloadData) {
            if (response.preloadData.hasOwnProperty(placementPreloadData)) {
                const value = response.preloadData[placementPreloadData];
                preloadData[placementPreloadData] = {
                    ttlInSeconds: value.ttlInSeconds,
                    campaignAvailable: value.campaignAvailable,
                    dataIndex: value.dataIndex
                };
            }
        }
        return preloadData;
    }
    parseCampaign(response, mediaId, auctionStatusCode) {
        if (!mediaId) {
            return Promise.resolve(undefined);
        }
        if (this._currentSession === null) {
            throw new AdRequestManagerError('Session is not set', 'no_session');
        }
        let auctionResponse;
        let parser;
        try {
            auctionResponse = new AuctionResponse([], response.media[mediaId], mediaId, response.correlationId, auctionStatusCode);
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to prepare AuctionPlacement and AuctionResponse', 'prep'));
        }
        try {
            parser = this.getCampaignParser(auctionResponse.getContentType());
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to create parser', 'create_parser'));
        }
        return parser.parse(auctionResponse, this._currentSession).catch((err) => {
            throw new AdRequestManagerError('Failed to parse', 'campaign_parse');
        }).then((campaign) => {
            if (campaign) {
                campaign.setMediaId(auctionResponse.getMediaId());
                campaign.setIsLoadEnabled(true);
                return campaign;
            }
            else {
                throw new AdRequestManagerError('Failed to read campaign', 'no_campaign');
            }
        });
    }
    parseTrackingUrls(response, trackingId, auctionStatusCode) {
        if (!trackingId) {
            return Promise.resolve(undefined);
        }
        let trackingUrls;
        try {
            if (response.tracking[trackingId]) {
                trackingUrls = response.tracking[trackingId];
            }
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed tracking url', 'tracking'));
        }
        return Promise.resolve(trackingUrls);
    }
    createNotCachedLoadedCampaign(response, campaign, trackingId, auctionStatusCode) {
        return Promise.all([
            this.parseTrackingUrls(response, trackingId, auctionStatusCode)
        ]).then(([trackingUrls]) => {
            if (!campaign || !trackingUrls) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve({ notCachedCampaign: campaign, notCachedTrackingUrls: trackingUrls });
        });
    }
    parseMediaAndTrackingUrls(response, placement, auctionStatusCode) {
        const placementId = placement.getId();
        let mediaId;
        let trackingId;
        try {
            if (response.placements.hasOwnProperty(placementId)) {
                if (response.placements[placementId].hasOwnProperty('mediaId')) {
                    mediaId = response.placements[placementId].mediaId;
                }
            }
            if (response.placements.hasOwnProperty(placementId)) {
                if (response.placements[placementId].hasOwnProperty('trackingId')) {
                    trackingId = response.placements[placementId].trackingId;
                }
            }
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to get media and tracking url', 'media'));
        }
        return Promise.resolve({
            mediaId,
            trackingId
        });
    }
    cacheCampaign(notCachedLoadedCampaign) {
        if (notCachedLoadedCampaign === undefined) {
            return Promise.resolve(undefined);
        }
        if (CampaignAssetInfo.isCached(notCachedLoadedCampaign.notCachedCampaign)) {
            return Promise.resolve({
                campaign: notCachedLoadedCampaign.notCachedCampaign,
                trackingUrls: notCachedLoadedCampaign.notCachedTrackingUrls
            });
        }
        return this._assetManager.setup(notCachedLoadedCampaign.notCachedCampaign).catch((err) => {
            // If caching failed, we still can stream an ad.
            return notCachedLoadedCampaign.notCachedCampaign;
        }).then((campaign) => {
            return {
                campaign: campaign,
                trackingUrls: notCachedLoadedCampaign.notCachedTrackingUrls
            };
        });
    }
    parseAllPlacements(json, allPlacements, auctionStatusCode, errorMetric) {
        let allMedia = [];
        let campaignMap = {};
        let parsedMap = {};
        return Promise.all(allPlacements.map((plc) => this.parseMediaAndTrackingUrls(json, plc, auctionStatusCode))).then(medias => {
            parsedMap = medias.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});
            allMedia = medias.reduce((previousValue, currentValue, currentIndex) => {
                if (currentValue.mediaId) {
                    previousValue.push(currentValue.mediaId);
                }
                return previousValue;
            }, []);
            allMedia = allMedia.filter((val, index) => allMedia.indexOf(val) === index);
            return Promise.all(allMedia.map((media) => this.parseCampaign(json, media, auctionStatusCode).catch((err) => {
                this.handleError(errorMetric, err);
                return undefined;
            })));
        }).then(allCampaigns => {
            campaignMap = allCampaigns.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[allMedia[currentIndex]] = currentValue;
                return previousValue;
            }, {});
            return Promise.all(
            // Skip caching for those campaigns since we don't need them immediately
            allPlacements.map((x) => this.createNotCachedLoadedCampaign(json, parsedMap[x.getId()].mediaId === undefined ? undefined : campaignMap[parsedMap[x.getId()].mediaId], parsedMap[x.getId()].trackingId, auctionStatusCode).catch((err) => {
                this.handleError(errorMetric, err);
                return undefined;
            })));
        }).then((loadedCampaigns) => {
            return loadedCampaigns.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});
        });
    }
    parseReloadResponse(response, placementsToLoad, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }
        const auctionId = json.auctionId;
        if (!auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction id', 'auction_id'));
        }
        this._preloadData = this.parsePreloadData(json);
        this.updatePreloadDataExpiration();
        this._currentSession = this._sessionManager.create(auctionId);
        this._currentSession.setGameSessionCounters(gameSessionCounters);
        this._currentSession.setPrivacy(requestPrivacy);
        this._currentSession.setLegacyPrivacy(legacyRequestPrivacy);
        this._currentSession.setDeviceFreeSpace(this._deviceFreeSpace);
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if (!('placements' in json)) {
            placementsToLoad.forEach((x) => this.onNoFill.trigger(x.getId()));
            return Promise.resolve();
        }
        return this.parseAllPlacements(json, placementsToLoad, auctionStatusCode, LoadV5.ReloadRequestParseCampaignFailed)
            .then((notCachedLoadedCampaigns) => {
            return Promise.all(placementsToLoad.map((placement) => {
                const placementId = placement.getId();
                return this.cacheCampaign(notCachedLoadedCampaigns[placementId]);
            }));
        }).then((loadedCampaigns) => {
            loadedCampaigns.forEach((loadedCampaign, index) => {
                const placementId = placementsToLoad[index].getId();
                if (loadedCampaign !== undefined) {
                    this._reloadResults[placementId] = loadedCampaign;
                    this.onCampaign.trigger(placementId, loadedCampaign.campaign, loadedCampaign.trackingUrls);
                }
                else {
                    this.onNoFill.trigger(placementId);
                }
            });
        });
    }
    getCampaignParser(contentType) {
        return this._contentTypeHandlerManager.getParser(contentType);
    }
    updatePreloadDataExpiration() {
        if (this._preloadData === null) {
            return;
        }
        let ttl;
        for (const placementPreloadData in this._preloadData) {
            if (this._preloadData.hasOwnProperty(placementPreloadData)) {
                if (ttl === undefined) {
                    ttl = this._preloadData[placementPreloadData].ttlInSeconds;
                }
                else {
                    ttl = Math.min(this._preloadData[placementPreloadData].ttlInSeconds, ttl);
                }
            }
        }
        if (ttl === undefined) {
            ttl = 7200;
        }
        this._preloadDataExpireAt = Date.now() + ttl * 1000;
    }
    makePreloadBody(body) {
        body.preload = true;
        body.load = false;
        body.preloadPlacements = body.placements;
        body.placements = {};
        body.preloadData = {};
        return body;
    }
    makeEncryptedPreloadData(currentPreloadData, encryptedPreloadData) {
        if (encryptedPreloadData === undefined) {
            return undefined;
        }
        const currentEncryptedProloadData = {};
        for (const placementPreloadData in currentPreloadData) {
            if (currentPreloadData.hasOwnProperty(placementPreloadData)) {
                const value = currentPreloadData[placementPreloadData];
                if (currentEncryptedProloadData[value.dataIndex] == null) {
                    currentEncryptedProloadData[value.dataIndex] = encryptedPreloadData[value.dataIndex];
                }
            }
        }
        return currentEncryptedProloadData;
    }
    makeLoadBody(body, placementId, additionalPlacements) {
        const preloadData = {};
        if (this._preloadData !== null) {
            const tempPreloadData = this._preloadData;
            if (tempPreloadData !== undefined) {
                preloadData[placementId] = tempPreloadData[placementId];
            }
            additionalPlacements.reduce((previousValue, currentValue) => {
                if (tempPreloadData[currentValue] !== undefined) {
                    previousValue[currentValue] = tempPreloadData[currentValue];
                }
                return previousValue;
            }, preloadData);
        }
        if (this._currentSession === null) {
            throw new AdRequestManagerError('Current session is not set', 'no_session');
        }
        additionalPlacements.reduce((previousValue, currentValue) => {
            const placement = this._adsConfig.getPlacement(currentValue);
            previousValue[currentValue] = {
                adTypes: placement.getAdTypes(),
                allowSkip: placement.allowSkip(),
                auctionType: placement.getAuctionType()
            };
            return previousValue;
        }, body.placements);
        body.auctionId = this._currentSession.getId();
        body.load = true;
        body.preload = false;
        body.preloadData = preloadData;
        body.preloadPlacements = {};
        body.encryptedPreloadData = this.makeEncryptedPreloadData(preloadData, this._encryptedPreloadData);
        return body;
    }
    makeReloadBody(body, reloadPlacement) {
        const placementToReload = {};
        reloadPlacement.forEach((placement) => {
            if (!placement.isBannerPlacement()) {
                placementToReload[placement.getId()] = {
                    adTypes: placement.getAdTypes(),
                    allowSkip: placement.allowSkip(),
                    auctionType: placement.getAuctionType()
                };
            }
        });
        body.load = true;
        body.preload = true;
        body.preloadPlacements = body.placements;
        body.placements = placementToReload;
        body.preloadData = {};
        return body;
    }
    handleError(event, err, tags = {}) {
        let reason = 'unknown';
        if (err instanceof AdRequestManagerError) {
            reason = err.tag;
        }
        else if (err instanceof RequestError) {
            if (err.nativeResponse) {
                reason = err.nativeResponse.responseCode.toString();
            }
            else {
                reason = 'request';
            }
        }
        this.reportMetricEvent(event, Object.assign({ 'rsn': reason }, tags));
    }
    reportMetricEvent(metric, tags = {}) {
        SDKMetrics.reportMetricEventWithTags(metric, Object.assign({}, tags, { 'exp': this._currentExperiment }));
    }
}
AdRequestManager.LoadV5BaseUrl = 'https://auction-load.unityads.unity3d.com/v5/games';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRSZXF1ZXN0TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvQWRSZXF1ZXN0TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsZUFBZSxFQUFtQixNQUFNLDhCQUE4QixDQUFDO0FBZ0JoRixPQUFPLEVBQUUsbUJBQW1CLEVBQXdCLE1BQU0sbUNBQW1DLENBQUM7QUFDOUYsT0FBTyxFQUFFLHFCQUFxQixFQUEwQyxNQUFNLDJCQUEyQixDQUFDO0FBQzFHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQXlCLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBSXZHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFcEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBNEJwRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsS0FBSztJQUc1QyxZQUFZLE9BQWUsRUFBRSxHQUFXO1FBQ3BDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBTixJQUFZLG9CQUdYO0FBSEQsV0FBWSxvQkFBb0I7SUFDNUIscUNBQWEsQ0FBQTtJQUNiLDBEQUFrQyxDQUFBO0FBQ3RDLENBQUMsRUFIVyxvQkFBb0IsS0FB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