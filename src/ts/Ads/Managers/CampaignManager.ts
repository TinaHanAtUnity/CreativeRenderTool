import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignParserFactory } from 'Ads/Parsers/CampaignParserFactory';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { WebViewError } from 'Core/Errors/WebViewError';
import { JaegerManager } from 'Core/Jaeger/JaegerManager';
import { JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CacheError } from 'Core/Native/Cache';
import { StorageType } from 'Core/Native/Storage';
import { CacheStatus } from 'Core/Utilities/Cache';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Observable1, Observable2, Observable4 } from 'Core/Utilities/Observable';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { CampaignErrorHandlerFactory } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { CampaignError } from 'Ads/Errors/CampaignError';

export class CampaignManager {

    public static setCampaignId(campaignId: string) {
        CampaignManager.CampaignId = campaignId;
    }

    public static setSessionId(sessionId: string) {
        CampaignManager.SessionId = sessionId;
    }

    public static setSeatId(seatId: number) {
        CampaignManager.SeatId = seatId;
    }

    public static setCreativeId(creativeId: string) {
        CampaignManager.CreativeId = creativeId;
    }

    public static setCountry(country: string) {
        CampaignManager.Country = country;
    }

    public static setCampaignResponse(campaignResponse: string) {
        CampaignManager.CampaignResponse = campaignResponse;
    }

    public static setBaseUrl(baseUrl: string): void {
        CampaignManager.BaseUrl = baseUrl + '/v4/games';
    }

    protected static CampaignResponse: string | undefined;

    protected static AbGroup: ABGroup | undefined;

    private static BaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';

    private static CampaignId: string | undefined;
    private static SessionId: string | undefined;
    private static Country: string | undefined;
    private static CreativeId: string | undefined;
    private static SeatId: number | undefined;

    public readonly onCampaign = new Observable2<string, Campaign>();
    public readonly onNoFill = new Observable1<string>();
    public readonly onError = new Observable4<WebViewError, string[], string, Session | undefined>();
    public readonly onConnectivityError = new Observable1<string[]>();
    public readonly onAdPlanReceived = new Observable2<number, number>();

    protected _nativeBridge: NativeBridge;
    protected _requesting: boolean;
    protected _assetManager: AssetManager;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;
    protected _clientInfo: ClientInfo;
    protected _cacheBookkeeping: CacheBookkeeping;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _backupCampaignManager: BackupCampaignManager;
    private _request: Request;
    private _deviceInfo: DeviceInfo;
    private _deviceConnectionType: string | undefined;
    private _previousPlacementId: string | undefined;
    private _realtimeUrl: string | undefined;
    private _realtimeBody: any = {};
    private _jaegerManager: JaegerManager;
    private _lastAuctionId: string | undefined;

    constructor(nativeBridge: NativeBridge, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, cacheBookkeeping: CacheBookkeeping, jaegerManager: JaegerManager, backupCampaignManager: BackupCampaignManager) {
        this._nativeBridge = nativeBridge;
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
        this._requesting = false;
        this._jaegerManager = jaegerManager;
        this._backupCampaignManager = backupCampaignManager;
    }

    public request(nofillRetry?: boolean): Promise<INativeResponse | void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        GameSessionCounters.addAdRequest();

        this._assetManager.enableCaching();
        this._assetManager.checkFreeSpace();

        this._requesting = true;

        this.resetRealtimeDataForPlacements();
        const jaegerSpan = this._jaegerManager.startSpan('CampaignManagerRequest');
        jaegerSpan.addTag(JaegerTags.DeviceType, Platform[this._nativeBridge.getPlatform()]);
        return Promise.all([this.createRequestUrl(false, nofillRetry), this.createRequestBody(nofillRetry)]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
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
                const headers: Array<[string, string]> = [];
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
                if(response) {
                    this.setSDKSignalValues(requestTimestamp);

                    return this.parseCampaigns(response).catch((e) => {
                        this.handleError(e, this._adsConfig.getPlacementIds(), 'parse_campaigns_error');
                    });
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
                return this.handleError(error, this._adsConfig.getPlacementIds(), 'auction_request_failed');
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
        return Promise.all([this.createRequestUrl(true, undefined, session), this.createRequestBody(false, placement)]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting realtime ad plan from ' + requestUrl);
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
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
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

    private parseCampaigns(response: INativeResponse): Promise<void[]> {
        let json;
        try {
            json = JsonParser.parse(response.response);
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

        this._backupCampaignManager.deleteBackupCampaigns();
        this._cacheBookkeeping.deleteCachedCampaignResponse(); // todo: legacy backup campaign cleanup, remove in early 2019

        if('placements' in json) {
            const fill: { [mediaId: string]: string[] } = {};
            const noFill: string[] = [];

            const placements = this._adsConfig.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    const mediaId: string = json.placements[placement];

                    if(mediaId) {
                        if(fill[mediaId]) {
                            fill[mediaId].push(placement);
                        } else {
                            fill[mediaId] = [placement];
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
            const promises: Array<Promise<void>> = [];

            for(const placement of noFill) {
                promises.push(this.handleNoFill(placement));
                refreshDelay = RefreshManager.NoFillDelay;
            }

            let campaigns: number = 0;
            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    campaigns++;

                    const contentType = json.media[mediaId].contentType;
                    const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                    if(contentType && contentType !== 'comet/campaign' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                        refreshDelay = cacheTTL;
                    }
                }
            }

            this._nativeBridge.Sdk.logInfo('AdPlan received with ' + campaigns + ' campaigns and refreshDelay ' + refreshDelay);
            this.onAdPlanReceived.trigger(refreshDelay, campaigns);

            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    let auctionResponse: AuctionResponse;
                    try {
                        auctionResponse = new AuctionResponse(fill[mediaId], json.media[mediaId], mediaId, json.correlationId);
                        promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                            if(error === CacheStatus.STOPPED) {
                                return Promise.resolve();
                            } else if(error === CacheStatus.FAILED) {
                                return this.handleError(new WebViewError('Caching failed', 'CacheStatusFailed'), fill[mediaId], 'campaign_caching_failed', session);
                            } else if(error === CacheError[CacheError.FILE_NOT_FOUND]) {
                                // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                                return this.handleError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), fill[mediaId], 'campaign_caching_get_file_path_failed', session);
                            }

                            return this.handleParseCampaignError(auctionResponse.getContentType(), error, fill[mediaId], session);
                        }));
                    } catch(error) {
                        this.handleError(error, fill[mediaId], 'error_creating_handle_campaign_chain', session);
                    }
                }
            }

            return Promise.all(promises);
        } else {
            throw new Error('No placements found');
        }
    }

    private parseRealtimeCampaign(response: INativeResponse, session: Session, placement: Placement): Promise<Campaign | void> {
        const json = JsonParser.parse(response.response);

        if('placements' in json) {
            const mediaId: string = json.placements[placement.getId()];

            if(mediaId) {
                const oldCampaign = placement.getCurrentCampaign();

                if(oldCampaign && oldCampaign.getMediaId() === mediaId) {
                    return Promise.resolve(oldCampaign);
                }

                const auctionResponse = new AuctionResponse([placement.getId()], json.media[mediaId], mediaId, json.correlationId);

                return this.handleRealtimeCampaign(auctionResponse, session);
            } else {
                return Promise.resolve(); // no fill
            }
        } else {
            this._nativeBridge.Sdk.logError('No placements found in realtime campaign json.');
            return Promise.resolve();
        }
    }

    private handleCampaign(response: AuctionResponse, session: Session): Promise<void> {
        this._nativeBridge.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        let parser: CampaignParser;

        if(this._sessionManager.getGameSessionId() % 1000 === 99) {
            SessionDiagnostics.trigger('ad_received', {
                contentType: response.getContentType()
            }, session);
        }

        try {
            parser = this.getCampaignParser(response.getContentType());
        } catch (e) {
            return Promise.reject(e);
        }

        const parseTimestamp = Date.now();
        return parser.parse(this._nativeBridge, this._request, response, session, this._deviceInfo.getOsVersion(), this._clientInfo.getGameId(), this._deviceConnectionType).then((campaign) => {
            const parseDuration = Date.now() - parseTimestamp;
            for(const placement of response.getPlacements()) {
                SdkStats.setParseDuration(placement, parseDuration);
            }

            campaign.setMediaId(response.getMediaId());

            return this.setupCampaignAssets(response.getPlacements(), campaign, response.getContentType(), session);
        });
    }

    private setupCampaignAssets(placements: string[], campaign: Campaign, contentType: string, session: Session): Promise<void> {
        const cachingTimestamp = Date.now();
        return this._assetManager.setup(campaign).then(() => {
            if(this._sessionManager.getGameSessionId() % 1000 === 99) {
                SessionDiagnostics.trigger('ad_ready', {
                    contentType: contentType
                }, session);
            }

            if (campaign instanceof PerformanceMRAIDCampaign) {
                const cachingDuration = Date.now() - cachingTimestamp;

                const kafkaObject: any = {};
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
                this.onCampaign.trigger(placement, campaign);
            }
        });
    }

    private handleRealtimeCampaign(response: AuctionResponse, session: Session): Promise<Campaign> {
        this._nativeBridge.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());

        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        return parser.parse(this._nativeBridge, this._request, response, session).then((campaign) => {
            campaign.setMediaId(response.getMediaId());

            return campaign;
        });
    }

    private getCampaignParser(contentType: string): CampaignParser {
        return CampaignParserFactory.getCampaignParser(contentType);
    }

    private handleNoFill(placement: string): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onNoFill.trigger(placement);
        return Promise.resolve();
    }

    private handleError(error: any, placementIds: string[], diagnosticsType: string, session?: Session): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error, placementIds, diagnosticsType, session);
        return Promise.resolve();
    }

    private handleParseCampaignError(contentType: string, campaignError: CampaignError, placementIds: string[], session?: Session): Promise<void> {

        if (CampaignManager.CreativeId && CampaignManager.SeatId) {
            const kafkaObject: any = {};
            kafkaObject.type = 'parse_error';
            kafkaObject.creativeId = CampaignManager.CreativeId;
            kafkaObject.seatId = CampaignManager.SeatId;
            if (campaignError.errorCode && campaignError.message) {
                kafkaObject.errorCode = campaignError.errorCode;
                kafkaObject.message = campaignError.message;
            }

            HttpKafka.sendEvent('ads.creative.blocking', KafkaCommonObjectType.EMPTY, kafkaObject);
        }

        const campaignErrorHandler = CampaignErrorHandlerFactory.getCampaignErrorHandler(contentType, this._nativeBridge, this._request);
        campaignErrorHandler.handleCampaignError(campaignError);

        return this.handleError(campaignError, placementIds, `parse_campaign_${contentType.replace(/[\/-]/g, '_')}_error`, session);
    }

    private getBaseUrl(): string {
        return [
            CampaignManager.BaseUrl,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
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

        if(this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking()
            });
        } else if(this._clientInfo.getPlatform() === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                androidId: this._deviceInfo.getAndroidId()
            });
        }

        if (nofillRetry && this._lastAuctionId) {
            url = Url.addParameters(url, {
                auctionId: this._lastAuctionId
            });
        }

        url = Url.addParameters(url, {
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            stores: this._deviceInfo.getStores()
        });

        if(this._clientInfo.getPlatform() === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
            url = Url.addParameters(url, {
                osVersion: this._deviceInfo.getOsVersion(),
                screenScale: this._deviceInfo.getScreenScale()
            });
        } else if(this._clientInfo.getPlatform() === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
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
                forceAbGroup: CampaignManager.AbGroup.toNumber()
            });
        }

        if(CampaignManager.Country) {
            url = Url.addParameters(url, {
                force_country: CampaignManager.Country
            });
        }

        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getScreenWidth());
        promises.push(this._deviceInfo.getScreenHeight());
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());

        return Promise.all(promises).then(([screenWidth, screenHeight, connectionType, networkType]) => {
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

    private createRequestBody(nofillRetry?: boolean, realtimePlacement?: Placement): Promise<any> {
        const placementRequest: any = {};

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
                const realtimeDataObject: any = {};
                realtimeDataObject[realtimePlacement.getId()] = realtimePlacement.getRealtimeData();
                this._realtimeBody.realtimeData = realtimeDataObject;
            }

            return this._deviceInfo.getFreeSpace().then((freeSpace) => {
                this._realtimeBody.deviceFreeSpace = freeSpace;
                return this._realtimeBody;
            }).catch((e) => {
                // Try the request with the original request value anyways
                return this._realtimeBody;
            });
        }
        this._realtimeBody = undefined;

        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());
        promises.push(this._deviceInfo.getHeadset());
        promises.push(this._deviceInfo.getDeviceVolume());
        promises.push(this.getFullyCachedCampaigns());
        promises.push(this.getVersionCode());
        promises.push(this._adMobSignalFactory.getAdRequestSignal().then(signal => {
            return signal.getBase64ProtoBufNonEncoded();
        }));
        promises.push(this._adMobSignalFactory.getOptionalSignal().then(signal => {
            return signal.getDTO();
        }));

        const body: any = {
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

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, headset, volume, fullyCachedCampaignIds, versionCode, requestSignal, optionalSignal]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;
            body.wiredHeadset = headset;
            body.volume = volume;
            body.requestSignal = requestSignal;
            body.ext = optionalSignal;

            if(fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) {
                body.cachedCampaigns = fullyCachedCampaignIds;
            }

            if(versionCode) {
                body.versionCode = versionCode;
            }

            const metaDataPromises: Array<Promise<any>> = [];
            metaDataPromises.push(this._metaDataManager.fetch(MediationMetaData));
            metaDataPromises.push(this._metaDataManager.fetch(FrameworkMetaData));

            return Promise.all(metaDataPromises).then(([mediation, framework]) => {
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
                            allowSkip: placement.allowSkip()
                        };
                    }
                });
                body.placements = placementRequest;
                body.properties = this._coreConfig.getProperties();
                body.sessionDepth = SdkStats.getAdRequestOrdinal();
                body.projectId = this._coreConfig.getUnityProjectId();
                body.gameSessionCounters = GameSessionCounters.getDTO();
                body.gdprEnabled = this._adsConfig.isGDPREnabled();
                body.optOutEnabled = this._adsConfig.isOptOutEnabled();
                body.optOutRecorded = this._adsConfig.isOptOutRecorded();
                body.abGroup = this._coreConfig.getAbGroup().toNumber();

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
        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
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

        UserCountData.getRequestCount(this._nativeBridge).then((requestCount) => {
            if (typeof requestCount === 'number') {
                UserCountData.setRequestCount(requestCount + 1, this._nativeBridge);
            }
        }).catch(() => {
            Diagnostics.trigger('request_count_failure', {
                signal: 'requestCount'
            });
        });
    }
}
