import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { IPlacementIdMap } from 'Ads/Managers/PlacementManager';
import { CampaignManager, ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ICore, ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { GameSessionCounters, IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { RequestPrivacyFactory, IRequestPrivacy, ILegacyRequestPrivacy } from 'Ads/Models/RequestPrivacy';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { IRawAuctionV5Response, AuctionStatusCode, AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { SDKMetrics, LoadV5 } from 'Ads/Utilities/SDKMetrics';
import { RequestError } from 'Core/Errors/RequestError';
import { SdkStats } from 'Ads/Utilities/SdkStats';

export interface IParsedPlacementPreloadData {
    campaignAvailable: boolean;
    ttlInSeconds: number;
    data: string;
}

interface ILoadV5BodyExtra {
    auctionId: string;
    preload: boolean;
    load: boolean;
    preloadPlacements: { [key: string]: unknown };
    placements: { [key: string]: unknown };
    preloadData: { [key: string]: IParsedPlacementPreloadData };
}

class AdRequestManagerError extends Error {
    public readonly tag: string;

    constructor(message: string, tag: string) {
        super(message);
        this.tag = tag;
    }
}

export class AdRequestManager extends CampaignManager {
    private _preloadData: IPlacementIdMap<IParsedPlacementPreloadData> | null;
    private _preloadDataExpireAt: number;

    private _ongoingPreloadRequest: Promise<void> | null;
    private _ongoingPreloadRequestResolve: () => void;
    private _ongoingReloadRequest: Promise<void> | null;
    private _ongoingLoadRequests: { [key: string]: boolean };
    private _reloadResults: { [key: string]: ILoadedCampaign };
    private _preloadFailed: boolean;
    private _activePreload: boolean;

    protected _platform: Platform;
    protected _core: ICoreApi;
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
    private _userPrivacyManager: UserPrivacyManager;
    private _currentSession: Session | null;

    constructor(platform: Platform, core: ICore, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, cacheBookkeeping: CacheBookkeepingManager, contentTypeHandlerManager: ContentTypeHandlerManager, privacySDK: PrivacySDK, userPrivacyManager: UserPrivacyManager) {
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
        this._privacy = privacySDK;
        this._userPrivacyManager = userPrivacyManager;
        this._ongoingReloadRequest = null;
        this._ongoingLoadRequests = {};
        this._reloadResults = {};
        this._preloadData = null;
        this._preloadFailed = false;
        this._ongoingPreloadRequest = new Promise((resolve) => { this._ongoingPreloadRequestResolve = resolve; });
        this._activePreload = false;
    }

    public requestPreload(): Promise<void> {
        // _ongoingPreloadRequest is used to trigger scheduled load requests
        // after preload request finished
        if (this._ongoingPreloadRequest === null) {
            this._ongoingPreloadRequest = new Promise((resolve) => { this._ongoingPreloadRequestResolve = resolve; });
        }

        if (this._activePreload) {
            SDKMetrics.reportMetricEvent(LoadV5.PreloadRequestAlreadyActive);

            let promiseResolve: () => void;
            const promise = new Promise<void>((resolve) => { promiseResolve = resolve; });

            this._ongoingPreloadRequest = this._ongoingPreloadRequest.then(() => { promiseResolve(); });

            return promise;
        }

        let countersForOperativeEvents: IGameSessionCounters;
        let requestPrivacy: IRequestPrivacy;
        let legacyRequestPrivacy: ILegacyRequestPrivacy;

        SDKMetrics.reportMetricEvent(LoadV5.PreloadRequestStarted);

        this._preloadData = null;
        this._currentSession = null;
        this._preloadFailed = false;
        this._activePreload = true;

        return Promise.resolve().then(() => {
            GameSessionCounters.addAdRequest();
            countersForOperativeEvents = GameSessionCounters.getCurrentCounters();

            requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
            legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);

            return Promise.all<string[], number | undefined, number>([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false)
            ]);
        }).then(([requestUrl, requestBody]) => CampaignManager.onlyRequest(this._request, requestUrl, this.makePreloadBody(<ILoadV5BodyExtra>requestBody), 0)).then((response) => {
            if (response) {
                SdkStats.increaseAdRequestOrdinal();
            }

            SDKMetrics.reportMetricEvent(LoadV5.PreloadRequestParsingResponse);
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

    public requestLoad(placementId: string): Promise<ILoadedCampaign | undefined> {
        // setting that placementId is being loaded,
        // this is used to track load cancellation due to reload request
        this._ongoingLoadRequests[placementId] = true;

        // schedule load request after preload
        if (this._ongoingPreloadRequest !== null) {
            SDKMetrics.reportMetricEvent(LoadV5.LoadRequestWhilePreloadOngoing);

            let promiseResolve: () => void;
            const promise = new Promise((resolve) => { promiseResolve = resolve; }).then(() =>
                this.requestLoad(placementId)
            );

            this._ongoingPreloadRequest = this._ongoingPreloadRequest.then(() => { promiseResolve(); });

            return promise;
        }

        // schedule load request after reload
        if (this._ongoingReloadRequest !== null) {
            SDKMetrics.reportMetricEvent(LoadV5.LoadRequestWhileReloadOngoing);

            let promiseResolve: () => void;
            const promise = new Promise((resolve) => { promiseResolve = resolve; }).then(() =>
                this.requestLoad(placementId)
            );

            this._ongoingReloadRequest = this._ongoingReloadRequest.then(() => { promiseResolve(); });

            return promise;
        }

        let requestPrivacy: IRequestPrivacy;
        let legacyRequestPrivacy: ILegacyRequestPrivacy;

        SDKMetrics.reportMetricEvent(LoadV5.LoadRequestStarted);

        return Promise.resolve().then(() => {
            if (this.hasPreloadFailed()) {
                SDKMetrics.reportMetricEvent(LoadV5.LoadRequestNoPreloadData);
                throw new AdRequestManagerError('Preload data does not exists', 'no_preload');
            }

            if (this.isPreloadDataExpired()) {
                SDKMetrics.reportMetricEvent(LoadV5.LoadRequestPreloadDataExpired);
                throw new AdRequestManagerError('Preload data expired', 'expired');
            }

            if (this._currentSession === null) {
                SDKMetrics.reportMetricEvent(LoadV5.LoadRequestCurrentSessionIsNotSet);
                throw new AdRequestManagerError('Session is not set', 'no_session');
            }

            requestPrivacy = RequestPrivacyFactory.create(this._privacy, this._deviceInfo.getLimitAdTracking());
            legacyRequestPrivacy = RequestPrivacyFactory.createLegacy(this._privacy);

            this._assetManager.enableCaching();
            this._assetManager.checkFreeSpace();

            return Promise.all<string[], number | undefined, number>([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()
            ]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, undefined, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, this._adsConfig.getPlacement(placementId))
            ]);
        }).then(([requestUrl, requestBody]) => CampaignManager.onlyRequest(this._request, requestUrl, this.makeLoadBody(<ILoadV5BodyExtra>requestBody, placementId), 0)).then((response) => {
            // if load request has been canceled by reload request, we start it again or we use result from reload request
            if (this._ongoingLoadRequests[placementId] === undefined) {
                if (this._reloadResults[placementId] !== undefined) {
                    return Promise.resolve(this._reloadResults[placementId]);
                }
                SDKMetrics.reportMetricEvent(LoadV5.LoadRequestWasCanceled);
                return this.requestLoad(placementId);
            }
            SDKMetrics.reportMetricEvent(LoadV5.LoadRequestParsingResponse);
            return this.parseLoadResponse(response, this._adsConfig.getPlacement(placementId));
        }).then((campaign) => {
            delete this._ongoingLoadRequests[placementId];
            return campaign;
        }).catch((err) => {
            delete this._ongoingLoadRequests[placementId];
            this.handleError(LoadV5.LoadRequestFailed, err);
            return undefined;
        });
    }

    public requestReload(placementsToLoad: string[]) {
        if (this._ongoingReloadRequest !== null) {
            SDKMetrics.reportMetricEvent(LoadV5.ReloadRequestOngoing);
            return Promise.resolve();
        }

        let countersForOperativeEvents: IGameSessionCounters;
        let requestPrivacy: IRequestPrivacy;
        let legacyRequestPrivacy: ILegacyRequestPrivacy;

        SDKMetrics.reportMetricEvent(LoadV5.ReloadRequestStarted);

        let promiseResolve: () => void;
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

            return Promise.all<string[], number | undefined, number>([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false)
            ]);
        }).then(([requestUrl, requestBody]) => CampaignManager.onlyRequest(this._request, requestUrl, this.makeReloadBody(<ILoadV5BodyExtra>requestBody, placementsToLoad.map((placementId) => this._adsConfig.getPlacement(placementId))), 0)).then((response) => {
            if (response) {
                SdkStats.increaseAdRequestOrdinal();
            }

            SDKMetrics.reportMetricEvent(LoadV5.ReloadRequestParsingResponse);
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

    public request(nofillRetry?: boolean | undefined): Promise<void | INativeResponse> {
        return this.requestPreload();
    }

    public loadCampaign(placement: Placement): Promise<ILoadedCampaign | undefined> {
        return this.requestLoad(placement.getId());
    }

    public isPreloadDataExpired(): boolean {
        return this._preloadData !== null && Date.now() > this._preloadDataExpireAt;
    }

    public hasPreloadFailed(): boolean {
        return this._preloadFailed;
    }

    private getBaseUrl(): string {
        return [
            CampaignManager.AuctionV5BaseUrl,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }

    private parsePreloadResponse(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy | undefined, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void> {
        let json: IRawAuctionV5Response;
        try {
            json = JsonParser.parse<IRawAuctionV5Response>(response.response);
        } catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }

        if (!json.auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction ID found', 'auction_id'));
        } else {
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

    private parseLoadResponse(response: INativeResponse, placement: Placement): Promise<ILoadedCampaign | undefined> {
        // time
        let json: IRawAuctionV5Response;
        try {
            json = JsonParser.parse<IRawAuctionV5Response>(response.response);
        } catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }

        const auctionId = json.auctionId;
        if (!auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction id', 'auction_id'));
        }

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        if (!('placements' in json)) {
            return Promise.reject(new AdRequestManagerError('No placement', 'no_plc'));
        }

        return this.parseCampaign(json, placement, auctionStatusCode);
    }

    private parsePreloadData(response: IRawAuctionV5Response): IPlacementIdMap<IParsedPlacementPreloadData> | null {
        if (!response.preloadData) {
            return null;
        }

        const preloadData: IPlacementIdMap<IParsedPlacementPreloadData> = {};

        for (const placementPreloadData in response.preloadData) {
            if (response.preloadData.hasOwnProperty(placementPreloadData)) {
                const value = response.preloadData[placementPreloadData];
                preloadData[placementPreloadData] = {
                    ttlInSeconds: value.ttlInSeconds,
                    campaignAvailable: value.campaignAvailable,
                    data: response.encryptedPreloadData ? response.encryptedPreloadData[value.dataIndex] || '' : ''
                };
            }
        }

        return preloadData;
    }

    private parseCampaign(response: IRawAuctionV5Response, placement: Placement, auctionStatusCode: AuctionStatusCode): Promise<ILoadedCampaign | undefined> {
        const placementId = placement.getId();
        let mediaId: string | undefined;
        let trackingUrls: ICampaignTrackingUrls | undefined;

        try {
            if (response.placements.hasOwnProperty(placementId)) {
                if (response.placements[placementId].hasOwnProperty('mediaId')) {
                    mediaId = response.placements[placementId].mediaId;
                }

                if (response.placements[placementId].hasOwnProperty('trackingId')) {
                    const trackingId: string = response.placements[placementId].trackingId;

                    if (response.tracking[trackingId]) {
                        trackingUrls = response.tracking[trackingId];
                    }
                }
            }
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to get media and tracking url', 'media'));
        }

        // This is no fill case, just return undefined
        if (!mediaId && !trackingUrls) {
            return Promise.resolve(undefined);
        }

        if (this._currentSession === null) {
            SDKMetrics.reportMetricEvent(LoadV5.LoadRequestCurrentSessionMissing);
            throw new AdRequestManagerError('Session is not set', 'no_session');
        }

        if (mediaId && trackingUrls) {
            let auctionPlacement: AuctionPlacement;
            let auctionResponse: AuctionResponse;
            let parser: CampaignParser;

            try {
                auctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);
                auctionResponse = new AuctionResponse([auctionPlacement], response.media[mediaId], mediaId, response.correlationId, auctionStatusCode);
            } catch (err) {
                return Promise.reject(new AdRequestManagerError('Failed to prepare AuctionPlacement and AuctionResponse', 'prep'));
            }

            try {
                parser = this.getCampaignParser(auctionResponse.getContentType());
            } catch (err) {
                return Promise.reject(new AdRequestManagerError('Failed to create parser', 'create_parser'));
            }

            return parser.parse(auctionResponse, this._currentSession).catch((err) => {
                throw new AdRequestManagerError('Failed to parse', 'campaign_parse');
            }).then((campaign) => {
                if (campaign) {
                    campaign.setMediaId(auctionResponse.getMediaId());
                    campaign.setIsLoadEnabled(true);
                    return campaign;
                } else {
                    throw new AdRequestManagerError('Failed to read campaign', 'no_campaign');
                }
            }).then(campaign => {
                return this._assetManager.setup(campaign).catch((err) => {
                    throw new AdRequestManagerError('Failed to setup campaign', 'campaign_setup');
                });
            }).then((campaign) => {
                if (trackingUrls) {
                    return {
                        campaign: campaign,
                        trackingUrls: trackingUrls
                    };
                } else {
                    throw new AdRequestManagerError('No tracking URLs', 'tracking');
                }
            });
        } else {
            return Promise.reject(new AdRequestManagerError('No media or tracking url', 'media_or_url'));
        }
    }

    private parseReloadResponse(response: INativeResponse, placementsToLoad: Placement[], gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy | undefined, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void> {
        let json: IRawAuctionV5Response;
        try {
            json = JsonParser.parse<IRawAuctionV5Response>(response.response);
        } catch (e) {
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

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

        if (!('placements' in json)) {
            placementsToLoad.forEach((x) => this.onNoFill.trigger(x.getId()));
            return Promise.resolve();
        }

        return Promise.all(
            placementsToLoad.map((x) => this.parseCampaign(json, x, auctionStatusCode).catch(() => {
                SDKMetrics.reportMetricEvent(LoadV5.ReloadRequestParseCampaignFailed);
                return undefined;
            }))
        ).then((loadedCampaigns) => {
            loadedCampaigns.forEach((loadedCampaign, index) => {
                const placementId = placementsToLoad[index].getId();
                if (loadedCampaign !== undefined) {
                    this._reloadResults[placementId] = loadedCampaign;
                    this.onCampaign.trigger(placementId, loadedCampaign.campaign, loadedCampaign.trackingUrls);
                } else {
                    this.onNoFill.trigger(placementId);
                }
            });
        });
    }

    private getCampaignParser(contentType: string): CampaignParser {
        return this._contentTypeHandlerManager.getParser(contentType);
    }

    private updatePreloadDataExpiration(): void {
        if (this._preloadData === null) {
            return;
        }

        let ttl: number | undefined;
        for (const placementPreloadData in this._preloadData) {
            if (this._preloadData.hasOwnProperty(placementPreloadData)) {
                if (ttl === undefined) {
                    ttl = this._preloadData[placementPreloadData].ttlInSeconds;
                } else {
                    ttl = Math.min(this._preloadData[placementPreloadData].ttlInSeconds, ttl);
                }
            }
        }

        if (ttl === undefined) {
            ttl = 3600;
        }

        this._preloadDataExpireAt = Date.now() + ttl * 1000;
    }

    private makePreloadBody(body: ILoadV5BodyExtra): unknown {
        body.preload = true;
        body.load = false;
        body.preloadPlacements = body.placements;
        body.placements = {};
        body.preloadData = {};
        return body;
    }

    private makeLoadBody(body: ILoadV5BodyExtra, placementId: string): unknown {
        const preloadData: IPlacementIdMap<IParsedPlacementPreloadData> = {};
        if (this._preloadData !== null && this._preloadData[placementId] !== undefined) {
            preloadData[placementId] = this._preloadData[placementId];
        }

        if (this._currentSession === null) {
            throw new AdRequestManagerError('Current session is not set', 'no_session');
        }

        body.auctionId = this._currentSession.getId();
        body.load = true;
        body.preload = false;
        body.preloadData = preloadData;
        body.preloadPlacements = {};
        return body;
    }

    private makeReloadBody(body: ILoadV5BodyExtra, reloadPlacement: Placement[]): unknown {
        const placementToReload: { [key: string]: unknown } = {};
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

    private handleError(event: LoadV5, err: unknown) {
        let reason: string = 'unknown';
        if (err instanceof AdRequestManagerError) {
            reason = err.tag;
        } else if (err instanceof RequestError) {
            if (err.nativeResponse) {
                reason = err.nativeResponse.responseCode.toString();
            } else {
                reason = 'request';
            }
        }

        SDKMetrics.reportMetricEventWithTags(event, { 'rsn': reason });
    }
}
