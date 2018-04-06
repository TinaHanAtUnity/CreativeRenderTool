import { Observable1, Observable2, Observable3 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { Request, INativeResponse } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { StorageType } from 'Native/Api/Storage';
import { AssetManager } from 'Managers/AssetManager';
import { WebViewError } from 'Errors/WebViewError';
import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { SessionManager } from 'Managers/SessionManager';
import { JsonParser } from 'Utilities/JsonParser';
import { RefreshManager } from 'Managers/RefreshManager';
import { CacheStatus } from 'Utilities/Cache';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { SdkStats } from 'Utilities/SdkStats';
import { CometCampaignParser } from 'Parsers/CometCampaignParser';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';
import { ProgrammaticMraidUrlParser } from 'Parsers/ProgrammaticMraidUrlParser';
import { ProgrammaticMraidParser } from 'Parsers/ProgrammaticMraidParser';
import { ProgrammaticStaticInterstitialParser } from 'Parsers/ProgrammaticStaticInterstitialParser';
import { ProgrammaticAdMobParser } from 'Parsers/ProgrammaticAdMobParser';
import { CampaignParser } from 'Parsers/CampaignParser';
import { PromoCampaignParser } from 'Parsers/PromoCampaignParser';
import { ProgrammaticVPAIDParser } from 'Parsers/ProgrammaticVPAIDParser';
import { XPromoCampaignParser } from 'Parsers/XPromoCampaignParser';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Placement } from 'Models/Placement';
import { RequestError } from 'Errors/RequestError';
import { CacheError } from 'Native/Api/Cache';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';
import { CampaignParserFactory } from 'Managers/CampaignParserFactory';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';

export class CampaignManager {

    public static setAbGroup(abGroup: number) {
        CampaignManager.AbGroup = abGroup;
    }

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
    }

    protected static CampaignResponse: string | undefined;

    protected static AbGroup: number | undefined;

    private static BaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';

    private static CampaignId: string | undefined;
    private static SessionId: string | undefined;
    private static Country: string | undefined;

    public readonly onCampaign = new Observable2<string, Campaign>();
    public readonly onNoFill = new Observable1<string>();
    public readonly onError = new Observable3<WebViewError, string[], Session | undefined>();
    public readonly onConnectivityError = new Observable1<string[]>();
    public readonly onAdPlanReceived = new Observable2<number, number>();

    protected _nativeBridge: NativeBridge;
    protected _requesting: boolean;
    protected _assetManager: AssetManager;
    protected _configuration: Configuration;
    protected _clientInfo: ClientInfo;
    protected _cacheBookkeeping: CacheBookkeeping;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _request: Request;
    private _deviceInfo: DeviceInfo;
    private _previousPlacementId: string | undefined;
    private _versionCode: number;
    private _fullyCachedCampaigns: string[] | undefined;
    private _skipErrors: boolean;

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, adMobSignalFactory: AdMobSignalFactory, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, cacheBookkeeping: CacheBookkeeping) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._assetManager = assetManager;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._metaDataManager = metaDataManager;
        this._adMobSignalFactory = adMobSignalFactory;
        this._cacheBookkeeping = cacheBookkeeping;
        this._requesting = false;
        this._skipErrors = false;
    }

    public requestFromCache(cachedResponse: INativeResponse): Promise<void[] | void> {
        if(this._requesting) {
            return Promise.resolve();
        }

        this._assetManager.enableCaching();
        this._assetManager.checkFreeSpace();

        this._skipErrors = true;
        this._requesting = true;

        this._fullyCachedCampaigns = undefined;
        this.resetRealtimeDataForPlacements();

        this._nativeBridge.Sdk.logInfo('Requesting ad plan from cache ' + cachedResponse.url);

        return this.parseCampaigns(cachedResponse).then(() => {
                this._skipErrors = false;
                this._requesting = false;
            }).catch((error) => {
                this._skipErrors = false;
                this._requesting = false;
            });
    }

    public request(nofillRetry?: boolean): Promise<INativeResponse | void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        this._assetManager.enableCaching();
        this._assetManager.checkFreeSpace();

        this._requesting = true;

        this._fullyCachedCampaigns = undefined;
        this.resetRealtimeDataForPlacements();
        return Promise.all([this.createRequestUrl(false), this.createRequestBody(nofillRetry)]).then(([requestUrl, requestBody]) => {
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
                return this._request.post(requestUrl, body, [], {
                    retries: 2,
                    retryDelay: 10000,
                    followRedirects: false,
                    retryWithConnectionEvents: false
                });
            }).then(response => {
                if(response) {
                    this._cacheBookkeeping.setCachedCampaignResponse(response);
                    SdkStats.setAdRequestDuration(Date.now() - requestTimestamp);
                    SdkStats.increaseAdRequestOrdinal();
                    return this.parseCampaigns(response).catch((e) => {
                        this.handleError(e, this._configuration.getPlacementIds());
                    });
                }
                throw new WebViewError('Empty campaign response', 'CampaignRequestError');
            }).then(() => {
                this._requesting = false;
            }).catch((error) => {
                this._requesting = false;
                if(error instanceof RequestError) {
                    if(!(<RequestError>error).nativeResponse) {
                        this.onConnectivityError.trigger(this._configuration.getPlacementIds());
                        return Promise.resolve();
                    }
                }
                return this.handleError(error, this._configuration.getPlacementIds());
            });
        });
    }

    public requestRealtime(placement: Placement, session: Session): Promise<Campaign | void> {
        return Promise.all([this.createRequestUrl(true, session), this.createRequestBody(false, placement)]).then(([requestUrl, requestBody]) => {
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
        if (this._fullyCachedCampaigns) {
            return Promise.resolve(this._fullyCachedCampaigns);
        }
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            this._fullyCachedCampaigns = campaignKeys;
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }

    public resetRealtimeDataForPlacements() {
        const placements = this._configuration.getPlacements();
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
        }

        const session: Session = this._sessionManager.create(json.auctionId);
        session.setAdPlan(response.response);

        if('placements' in json) {
            const fill: { [mediaId: string]: string[] } = {};
            const noFill: string[] = [];

            const placements = this._configuration.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    const mediaId: string = json.placements[placement];

                    if(mediaId) {
                        if(fill[mediaId]) {
                            fill[mediaId].push(placement);
                        } else {
                            fill[mediaId] = [placement];
                        }
                    } else {
                        noFill.push(placement);
                    }

                    if(json.realtimeData && json.realtimeData[placement]) {
                        this._configuration.getPlacement(placement).setRealtimeData(json.realtimeData[placement]);
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
                                return this.handleError(new WebViewError('Caching failed', 'CacheStatusFailed'), fill[mediaId], session);
                            } else if(error === CacheError[CacheError.FILE_NOT_FOUND]) {
                                // handle native API Cache.getFilePath failure (related to Android cache directory problems?)
                                return this.handleError(new WebViewError('Getting file path failed', 'GetFilePathFailed'), fill[mediaId], session);
                            }

                            return this.handleError(error, fill[mediaId], session);
                        }));
                    } catch(error) {
                        this.handleError(error, fill[mediaId], session);
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
        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        const parseTimestamp = Date.now();
        return parser.parse(this._nativeBridge, this._request, response, session, this._configuration.getGamerId(), this.getAbGroup()).then((campaign) => {
            const parseDuration = Date.now() - parseTimestamp;
            for(const placement of response.getPlacements()) {
                SdkStats.setParseDuration(placement, parseDuration);
            }

            campaign.setMediaId(response.getMediaId());

            return this.setupCampaignAssets(response.getPlacements(), campaign);
        });
    }

    private setupCampaignAssets(placements: string[], campaign: Campaign): Promise<void> {
        return this._assetManager.setup(campaign).then(() => {
            for(const placement of placements) {
                this.onCampaign.trigger(placement, campaign);
            }
        });
    }

    private handleRealtimeCampaign(response: AuctionResponse, session: Session): Promise<Campaign> {
        this._nativeBridge.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());

        const parser: CampaignParser = this.getCampaignParser(response.getContentType());

        return parser.parse(this._nativeBridge, this._request, response, session, this._configuration.getGamerId(), this.getAbGroup()).then((campaign) => {
            campaign.setMediaId(response.getMediaId());

            return campaign;
        });
    }

    private getCampaignParser(contentType: string): CampaignParser {
        return CampaignParserFactory.getCampaignParser(contentType);
    }

    private handleNoFill(placement: string): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC no fill for placement ' + placement);
        if (!this._skipErrors) {
            this.onNoFill.trigger(placement);
        }
        return Promise.resolve();
    }

    private handleError(error: any, placementIds: string[], session?: Session): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        if (!this._skipErrors) {
            this.onError.trigger(error, placementIds, session);
        }

        return Promise.resolve();
    }

    private getBaseUrl(): string {
        return [
            CampaignManager.BaseUrl,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }

    private getAbGroup(): number {
        return CampaignManager.AbGroup ? CampaignManager.AbGroup : this._configuration.getAbGroup();
    }

    private createRequestUrl(realtime: boolean, session?: Session): Promise<string> {
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

        url = Url.addParameters(url, {
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            stores: this._deviceInfo.getStores()
        });

        if(realtime && session) {
            url = Url.addParameters(url, {
                auctionId: session.getId()
            });
        }
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

        if(this._configuration.getTestMode()) {
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
                networkType: networkType,
                gamerId: this._configuration.getGamerId()
            });
            return url;
        });
    }

    private createRequestBody(nofillRetry?: boolean, realtimePlacement?: Placement): Promise<any> {
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

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            coppa: this._configuration.isCoppaCompliant(),
            language: this._deviceInfo.getLanguage(),
            gameSessionId: this._sessionManager.getGameSessionId(),
            timeZone: this._deviceInfo.getTimeZone(),
            simulator: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
            token: this._configuration.getToken()
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

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, headset, volume, fullyCachedCampaignIds, versionCode, requestSignal]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;
            body.wiredHeadset = headset;
            body.volume = volume;
            body.requestSignal = requestSignal;

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

                const placementRequest: any = {};

                if(realtimePlacement) {
                    placementRequest[realtimePlacement.getId()] = {
                        adTypes: realtimePlacement.getAdTypes(),
                        allowSkip: realtimePlacement.allowSkip(),
                    };

                    if(realtimePlacement.getRealtimeData()) {
                        const realtimeDataObject: any = {};
                        realtimeDataObject[realtimePlacement.getId()] = realtimePlacement.getRealtimeData();
                        body.realtimeData = realtimeDataObject;
                    }
                } else {
                    const placements = this._configuration.getPlacements();
                    for(const placement in placements) {
                        if(placements.hasOwnProperty(placement)) {
                            placementRequest[placement] = {
                                adTypes: placements[placement].getAdTypes(),
                                allowSkip: placements[placement].allowSkip(),
                            };
                        }
                    }
                }

                body.placements = placementRequest;
                body.properties = this._configuration.getProperties();
                body.sessionDepth = SdkStats.getAdRequestOrdinal();
                return body;
            });
        });
    }

    private getVersionCode(): Promise<number | undefined> {
        if (this._versionCode) {
            return Promise.resolve(this._versionCode);
        }
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
}
