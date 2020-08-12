import { ICampaignTrackingUrls, Campaign } from 'Ads/Models/Campaign';
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
import { Observable2 } from 'Core/Utilities/Observable';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { FileInfo } from 'Core/Utilities/FileInfo';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';

export interface INotCachedLoadedCampaign {
    notCachedCampaign: Campaign;
    notCachedTrackingUrls: ICampaignTrackingUrls;
}

export interface IParsedPlacementPreloadData {
    campaignAvailable: boolean;
    ttlInSeconds: number;
    dataIndex: string;
}

interface ILoadV5BodyExtra {
    auctionId: string;
    preload: boolean;
    load: boolean;
    preloadPlacements: { [key: string]: unknown };
    placements: { [key: string]: unknown };
    preloadData: { [key: string]: IParsedPlacementPreloadData };
    encryptedPreloadData?: { [key: string]: string};
}

interface IParsedMediaAndTrackingIds {
    mediaId: string | undefined;
    trackingId: string | undefined;
}

class AdRequestManagerError extends Error {
    public readonly tag: string;

    constructor(message: string, tag: string) {
        super(message);
        this.tag = tag;
    }
}

export enum LoadV5ExperimentType {
    None = 'none',
    NoInvalidation = 'no_invalidation'
}

export class AdRequestManager extends CampaignManager {
    protected static LoadV5BaseUrl: string = 'https://auction-load.unityads.unity3d.com/v5/games';

    private _preloadData: IPlacementIdMap<IParsedPlacementPreloadData> | null;
    private _preloadDataExpireAt: number;

    private _ongoingPreloadRequest: Promise<void> | null;
    private _ongoingPreloadRequestResolve: () => void;
    private _ongoingReloadRequest: Promise<void> | null;
    private _ongoingLoadRequests: { [key: string]: boolean };
    private _reloadResults: { [key: string]: ILoadedCampaign };
    private _preloadFailed: boolean;
    private _activePreload: boolean;
    private _currentExperiment: LoadV5ExperimentType;

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
    private _encryptedPreloadData: { [key: string]: string} | undefined;
    private _frequencyCapTimestamp: number | undefined;

    public readonly onAdditionalPlacementsReady = new Observable2<string | undefined, IPlacementIdMap<INotCachedLoadedCampaign | undefined>>();

    constructor(platform: Platform, core: ICore, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, cacheBookkeeping: CacheBookkeepingManager, contentTypeHandlerManager: ContentTypeHandlerManager, privacySDK: PrivacySDK, userPrivacyManager: UserPrivacyManager, experiment: LoadV5ExperimentType) {
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
        this._encryptedPreloadData = {};
        this._preloadFailed = false;
        this._ongoingPreloadRequest = new Promise((resolve) => { this._ongoingPreloadRequestResolve = resolve; });
        this._activePreload = false;
        this._currentExperiment = experiment;
    }

    public requestPreload(): Promise<void> {
        // _ongoingPreloadRequest is used to trigger scheduled load requests
        // after preload request finished
        if (this._ongoingPreloadRequest === null) {
            this._ongoingPreloadRequest = new Promise((resolve) => { this._ongoingPreloadRequestResolve = resolve; });
        }

        if (this._activePreload) {
            this.reportMetricEvent(LoadV5.PreloadRequestAlreadyActive);

            let promiseResolve: () => void;
            const promise = new Promise<void>((resolve) => { promiseResolve = resolve; });

            this._ongoingPreloadRequest = this._ongoingPreloadRequest.then(() => { promiseResolve(); });

            return promise;
        }

        let countersForOperativeEvents: IGameSessionCounters;
        let requestPrivacy: IRequestPrivacy;
        let legacyRequestPrivacy: ILegacyRequestPrivacy;

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

            return Promise.all<string[], number | undefined, number>([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, undefined, true)
            ]);
        }).then(([requestUrl, requestBody]) => this._request.post(requestUrl, JSON.stringify(this.makePreloadBody(<ILoadV5BodyExtra>requestBody)), [], {
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

    public requestLoad(placementId: string, additionalPlacements: string[] = [], rescheduled: boolean = false): Promise<ILoadedCampaign | undefined> {
        // setting that placementId is being loaded,
        // this is used to track load cancellation due to reload request
        this._ongoingLoadRequests[placementId] = true;

        // schedule load request after preload
        if (this._ongoingPreloadRequest !== null) {
            let promiseResolve: () => void;
            const promise = new Promise((resolve) => { promiseResolve = resolve; }).then(() =>
                this.requestLoad(placementId, additionalPlacements, true)
            );

            this._ongoingPreloadRequest = this._ongoingPreloadRequest.then(() => { promiseResolve(); });

            return promise;
        }

        // schedule load request after reload
        if (this._ongoingReloadRequest !== null) {
            let promiseResolve: () => void;
            const promise = new Promise((resolve) => { promiseResolve = resolve; }).then(() =>
                this.requestLoad(placementId, additionalPlacements, true)
            );

            this._ongoingReloadRequest = this._ongoingReloadRequest.then(() => { promiseResolve(); });

            return promise;
        }

        let requestPrivacy: IRequestPrivacy;
        let legacyRequestPrivacy: ILegacyRequestPrivacy;

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

            return Promise.all<string[], number | undefined, number>([
                CampaignManager.getFullyCachedCampaigns(this._core),
                CampaignManager.getVersionCode(this._platform, this._core, this._clientInfo),
                this._deviceInfo.getFreeSpace()
            ]);
        }).then(([fullyCachedCampaignIds, versionCode, freeSpace]) => {
            this._deviceFreeSpace = freeSpace;
            return Promise.all<string, unknown>([
                CampaignManager.createRequestUrl(this.getBaseUrl(), this._platform, this._clientInfo, this._deviceInfo, this._coreConfig, this._lastAuctionId, false),
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, undefined, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, this._adsConfig.getPlacement(placementId), true)
            ]);
        }).then(([requestUrl, requestBody]) => this._request.post(requestUrl, JSON.stringify(this.makeLoadBody(<ILoadV5BodyExtra>requestBody, placementId, additionalPlacements)), [], {
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

    public requestReload(placementsToLoad: string[]) {
        if (this._ongoingReloadRequest !== null) {
            return Promise.resolve();
        }

        let countersForOperativeEvents: IGameSessionCounters;
        let requestPrivacy: IRequestPrivacy;
        let legacyRequestPrivacy: ILegacyRequestPrivacy;

        this.reportMetricEvent(LoadV5.ReloadRequestStarted);

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
                CampaignManager.createRequestBody(this._clientInfo, this._coreConfig, this._deviceInfo, this._userPrivacyManager, this._sessionManager, this._privacy, countersForOperativeEvents, fullyCachedCampaignIds, versionCode, this._adMobSignalFactory, freeSpace, this._metaDataManager, this._adsConfig, true, this.getPreviousPlacementId(), requestPrivacy, legacyRequestPrivacy, false, undefined, true)
            ]);
        }).then(([requestUrl, requestBody]) => this._request.post(requestUrl, JSON.stringify(this.makeReloadBody(<ILoadV5BodyExtra>requestBody, placementsToLoad.map((placementId) => this._adsConfig.getPlacement(placementId)))), [], {
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

    public request(nofillRetry?: boolean | undefined): Promise<void | INativeResponse> {
        return this.requestPreload();
    }

    public loadCampaignWithAdditionalPlacement(placement: Placement): Promise<ILoadedCampaign | undefined> {
        let additionalPlacements: string[] = [];

        if (placement.hasGroupId()) {
            additionalPlacements = this._adsConfig.getPlacementsForGroupId(placement.getGroupId()!)
                .filter(placementId => placementId !== placement.getId());
        }

        return this.requestLoad(placement.getId(), additionalPlacements);
    }

    public loadCampaign(placement: Placement): Promise<ILoadedCampaign | undefined> {
        return this.requestLoad(placement.getId(), []);
    }

    public isPreloadDataExpired(): boolean {
        return this._preloadData !== null && Date.now() > this._preloadDataExpireAt;
    }

    public hasPreloadFailed(): boolean {
        return this._preloadFailed;
    }

    private getBaseUrl(): string {
        return [
            AdRequestManager.LoadV5BaseUrl,
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

    private parseLoadResponse(response: INativeResponse, placement: Placement, additionalPlacements: string[]): Promise<ILoadedCampaign | undefined> {
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
            const additionalCampaigns = additionalPlacements.reduce<IPlacementIdMap<INotCachedLoadedCampaign | undefined>>((previousValue, currentValue, currentIndex) => {
                previousValue[currentValue] = loadedCampaigns[currentValue];
                return previousValue;
            }, {});
            this.onAdditionalPlacementsReady.trigger(placement.getGroupId(), additionalCampaigns);

            return loadedCampaigns[placement.getId()];
        }).then(
            (notCachedLoadedCampaign) => this.cacheCampaign(notCachedLoadedCampaign)
        );
    }

    private parsePreloadData(response: IRawAuctionV5Response): IPlacementIdMap<IParsedPlacementPreloadData> | null {
        if (!response.preloadData) {
            return null;
        }

        const preloadData: IPlacementIdMap<IParsedPlacementPreloadData> = {};
        this._encryptedPreloadData = response.encryptedPreloadData;

        for (const placementPreloadData in response.preloadData) {
            if (response.preloadData.hasOwnProperty(placementPreloadData)) {
                const value = response.preloadData[placementPreloadData];
                preloadData[placementPreloadData] = {
                    ttlInSeconds: value.ttlInSeconds,
                    campaignAvailable: value.campaignAvailable,
                    dataIndex: value.dataIndex ? value.dataIndex : '0'
                };
            }
        }

        return preloadData;
    }

    private parseCampaign(response: IRawAuctionV5Response, mediaId: string | undefined, auctionStatusCode: AuctionStatusCode): Promise<Campaign | undefined> {
        if (!mediaId) {
            return Promise.resolve(undefined);
        }

        if (this._currentSession === null) {
            throw new AdRequestManagerError('Session is not set', 'no_session');
        }

        let auctionResponse: AuctionResponse;
        let parser: CampaignParser;

        try {
            auctionResponse = new AuctionResponse([], response.media[mediaId], mediaId, response.correlationId, auctionStatusCode);
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
        });
    }

    private parseTrackingUrls(response: IRawAuctionV5Response, trackingId: string | undefined, auctionStatusCode: AuctionStatusCode): Promise<ICampaignTrackingUrls | undefined> {
        if (!trackingId) {
            return Promise.resolve(undefined);
        }

        let trackingUrls: ICampaignTrackingUrls | undefined;

        try {
            if (response.tracking[trackingId]) {
                trackingUrls = response.tracking[trackingId];
            }
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed tracking url', 'tracking'));
        }

        return Promise.resolve(trackingUrls);
    }

    private createNotCachedLoadedCampaign(response: IRawAuctionV5Response, campaign: Campaign | undefined, trackingId: string | undefined, auctionStatusCode: AuctionStatusCode): Promise<INotCachedLoadedCampaign | undefined> {
        return Promise.all([
            this.parseTrackingUrls(response, trackingId, auctionStatusCode)
        ]).then(([trackingUrls]) => {
            if (!campaign || !trackingUrls) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve({ notCachedCampaign: campaign, notCachedTrackingUrls: trackingUrls });
        });
    }

    private parseMediaAndTrackingUrls(response: IRawAuctionV5Response, placement: Placement, auctionStatusCode: AuctionStatusCode): Promise<IParsedMediaAndTrackingIds> {
        const placementId = placement.getId();
        let mediaId: string | undefined;
        let trackingId: string | undefined;

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
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to get media and tracking url', 'media'));
        }

        return Promise.resolve({
            mediaId,
            trackingId
        });
    }

    public cacheCampaign(notCachedLoadedCampaign: INotCachedLoadedCampaign | undefined): Promise<ILoadedCampaign | undefined> {
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

    private parseAllPlacements(json: IRawAuctionV5Response, allPlacements: Placement[], auctionStatusCode: AuctionStatusCode, errorMetric: LoadV5): Promise<IPlacementIdMap<INotCachedLoadedCampaign | undefined>> {
        let allMedia: string[] = [];
        let campaignMap: IPlacementIdMap<Campaign | undefined> = {};
        let parsedMap: IPlacementIdMap<IParsedMediaAndTrackingIds> = {};

        return Promise.all(allPlacements.map((plc) => this.parseMediaAndTrackingUrls(json, plc, auctionStatusCode))).then(medias => {
            parsedMap = medias.reduce<IPlacementIdMap<IParsedMediaAndTrackingIds>>((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});

            allMedia = medias.reduce<string[]>((previousValue, currentValue, currentIndex) => {
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
            campaignMap = allCampaigns.reduce<IPlacementIdMap<Campaign | undefined>>((previousValue, currentValue, currentIndex) => {
                previousValue[allMedia[currentIndex]] = currentValue;
                return previousValue;
            }, {});

            return Promise.all(
                // Skip caching for those campaigns since we don't need them immediately
                allPlacements.map((x) => this.createNotCachedLoadedCampaign(json, parsedMap[x.getId()].mediaId === undefined ? undefined : campaignMap[parsedMap[x.getId()].mediaId!], parsedMap[x.getId()].trackingId, auctionStatusCode).catch((err) => {
                    this.handleError(errorMetric, err);
                    return undefined;
                }
            )));
        }).then((loadedCampaigns) => {
            return loadedCampaigns.reduce<IPlacementIdMap<INotCachedLoadedCampaign | undefined>>((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});
        });
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
            ttl = 7200;
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

    private makeEncryptedPreloadData(currentPreloadData: IPlacementIdMap<IParsedPlacementPreloadData>, encryptedPreloadData: { [key: string]: string } | undefined): { [key: string]: string } | undefined {
        // If preload response has no encryptedPreloadData, we will return {'0': ''}
        if (encryptedPreloadData === undefined) {
            return { '0': '' };
        }

        const currentEncryptedProloadData: { [key: string]: string } = {};
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

    private makeLoadBody(body: ILoadV5BodyExtra, placementId: string, additionalPlacements: string[]): unknown {
        const preloadData: IPlacementIdMap<IParsedPlacementPreloadData> = {};

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

    private handleError(event: LoadV5, err: unknown, tags: { [key: string]: string } = {}) {
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

        this.reportMetricEvent(event, { 'rsn': reason, ...tags });
    }

    public reportMetricEvent(metric: LoadV5, tags: { [key: string]: string } = {}) {
        SDKMetrics.reportMetricEventWithTags(metric, {
            ...tags,
            'exp': this._currentExperiment
        });
    }
}
