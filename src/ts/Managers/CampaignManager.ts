import { Observable2, Observable3 } from 'Utilities/Observable';
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
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';
import { CacheStatus } from 'Utilities/Cache';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { SdkStats } from 'Utilities/SdkStats';
import { CometCampaignParser } from 'Parsers/CometCampaignParser';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';
import { ProgrammaticMraidUrlParser } from 'Parsers/ProgrammaticMraidUrlParser';
import { ProgrammaticMraidParser } from 'Parsers/ProgrammaticMraidParser';
import { ProgrammaticStaticInterstitialParser } from 'Parsers/ProgrammaticStaticInterstitialParser';
import { CampaignParser } from 'Parsers/CampaignParser';
import { ProgrammaticVPAIDParser } from 'Parsers/ProgrammaticVPAIDParser';
import { Placement } from 'Models/Placement';
import { RealtimeCampaign } from 'Models/Campaigns/RealtimeCampaign';

export class CampaignManager {

    public static setAbGroup(abGroup: number) {
        CampaignManager.AbGroup = abGroup;
    }

    public static setCampaignId(campaignId: string) {
        CampaignManager.CampaignId = campaignId;
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
    private static Country: string | undefined;

    public readonly onCampaign = new Observable2<string, Campaign>();
    public readonly onNoFill = new Observable2<string, Session>();
    public readonly onError = new Observable3<WebViewError, string[], Session | undefined>();
    public readonly onAdPlanReceived = new Observable2<number, number>();

    protected _nativeBridge: NativeBridge;
    protected _requesting: boolean;
    protected _assetManager: AssetManager;
    protected _configuration: Configuration;
    protected _clientInfo: ClientInfo;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _request: Request;
    private _deviceInfo: DeviceInfo;
    private _previousPlacementId: string | undefined;

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._assetManager = assetManager;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._metaDataManager = metaDataManager;
        this._requesting = false;
    }

    public request(nofillRetry?: boolean): Promise<INativeResponse | void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        this._assetManager.enableCaching();

        this._requesting = true;

        return this._sessionManager.create().then((session) => {
            return Promise.all([this.createRequestUrl(session, false), this.createRequestBody(nofillRetry)]).then(([requestUrl, requestBody]) => {
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
                        retryWithConnectionEvents: true
                    });
                }).then(response => {
                    if(response) {
                        SdkStats.setAdRequestDuration(Date.now() - requestTimestamp);
                        SdkStats.increaseAdRequestOrdinal();
                        session.setAdPlan(response.response);
                        return this.parseCampaigns(response, session);
                    }
                    throw new WebViewError('Empty campaign response', 'CampaignRequestError');
                }).then(() => {
                    this._requesting = false;
                }).catch((error) => {
                    this._requesting = false;
                    return this.handleError(error, this._configuration.getPlacementIds(), session);
                });
            });
        });
    }

    public requestRealtime(placement: Placement, session: Session): Promise<INativeResponse | void> {
        this._requesting = true;

        return Promise.all([this.createRequestUrl(session, true), this.createRequestBody(false, placement)]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            const body = JSON.stringify(requestBody);
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
                    retryWithConnectionEvents: true
                });
            }).then(response => {
                if(response) {
                    // todo: set realtime ad plan to session
                    return this.parseCampaigns(response, session);
                }
                throw new WebViewError('Empty campaign response', 'CampaignRequestError');
            }).then(() => {
                this._requesting = false;
            }).catch((error) => {
                this._requesting = false;
                return this.handleError(error, this._configuration.getPlacementIds(), session);
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

    private parseCampaigns(response: INativeResponse, session: Session): Promise<void[]> {
        const json = JsonParser.parse(response.response);
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
                }
            }

            let refreshDelay: number = 0;
            const promises: Array<Promise<void>> = [];

            for(const placement of noFill) {
                promises.push(this.handleNoFill(placement, session));
                refreshDelay = CampaignRefreshManager.NoFillDelay;
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

    private handleCampaign(response: AuctionResponse, session: Session): Promise<void> {
        this._nativeBridge.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        let parser: CampaignParser;

        switch (response.getContentType()) {
            case 'comet/campaign':
                parser = new CometCampaignParser();
                break;
            case 'programmatic/vast':
                parser = new ProgrammaticVastParser();
                break;
            case 'programmatic/mraid-url':
                parser = new ProgrammaticMraidUrlParser();
                break;
            case 'programmatic/mraid':
                parser = new ProgrammaticMraidParser();
                break;
            case 'programmatic/static-interstitial':
                parser = new ProgrammaticStaticInterstitialParser();
                break;
            case 'programmatic/vast-vpaid':
                // vast-vpaid can be both VPAID or VAST, so in this case we use the VAST parser
                // which can parse both.
                parser = new ProgrammaticVPAIDParser();
                break;
            default:
                throw new Error('Unsupported content-type: ' + response.getContentType());
        }

        const parseTimestamp = Date.now();
        return parser.parse(this._nativeBridge, this._request, response, session, this._configuration.getGamerId(), this.getAbGroup()).then((campaign) => {
            const parseDuration = Date.now() - parseTimestamp;
            for(const placement of response.getPlacements()) {
                SdkStats.setParseDuration(placement, parseDuration);
            }

            campaign.setMediaId(response.getMediaId());
            campaign.setRawMedia(response.getRawData());

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

    private handleNoFill(placement: string, session: Session): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onNoFill.trigger(placement, session);
        return Promise.resolve();
    }

    private handleError(error: any, placementIds: string[], session: Session): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error, placementIds, session);

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

    private createRequestUrl(session: Session, realtime: boolean): Promise<string> {
        let url: string = this.getBaseUrl();

        if(this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking()
            });
        } else if(this._clientInfo.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: this._deviceInfo.getAndroidId()
            });
        }

        url = Url.addParameters(url, {
            auctionId: session ? session.getId() : undefined,
            deviceMake: this._deviceInfo.getManufacturer(),
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            screenSize: this._deviceInfo.getScreenLayout(),
            stores: this._deviceInfo.getStores(),
            streaming: realtime
        });

        if(this._clientInfo.getPlatform() === Platform.IOS) {
            url = Url.addParameters(url, {
                osVersion: this._deviceInfo.getOsVersion()
            });
        } else {
            url = Url.addParameters(url, {
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

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            coppa: this._configuration.isCoppaCompliant(),
            language: this._deviceInfo.getLanguage(),
            gameSessionId: this._sessionManager.getGameSessionId(),
            timeZone: this._deviceInfo.getTimeZone(),
            simulator: this._deviceInfo.isSimulator()
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

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, headset, volume, fullyCachedCampaignIds, versionCode]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;
            body.wiredHeadset = headset;
            body.volume = volume;

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
                        realtime: realtimePlacement.isRealtime()
                    };

                    const campaign = realtimePlacement.getCurrentCampaign();

                    if(campaign && !(campaign instanceof RealtimeCampaign)) {
                        const media = campaign.getRawMedia();
                        delete media.content;
                        body.media[campaign.getMediaId()] = media;
                    }
                } else {
                    const placements = this._configuration.getPlacements();
                    for(const placement in placements) {
                        if(placements.hasOwnProperty(placement)) {
                            placementRequest[placement] = {
                                adTypes: placements[placement].getAdTypes(),
                                allowSkip: placements[placement].allowSkip(),
                                realtime: placements[placement].isRealtime()
                            };
                        }
                    }
                }

                body.placements = placementRequest;
                body.properties = this._configuration.getProperties();

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
}
