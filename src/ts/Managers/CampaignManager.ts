import { Observable1, Observable2, Observable4 } from 'Utilities/Observable';
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
import { CometCampaignParser } from 'Parsers/CometCampaignParser';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';
import { ProgrammaticMraidUrlParser } from 'Parsers/ProgrammaticMraidUrlParser';
import { ProgrammaticMraidParser } from 'Parsers/ProgrammaticMraidParser';
import { ProgrammaticStaticInterstitialParser } from 'Parsers/ProgrammaticStaticInterstitialParser';
import { CampaignParser } from 'Parsers/CampaignParser';

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
    public readonly onNoFill = new Observable1<string>();
    public readonly onError = new Observable4<WebViewError, string[], string | undefined, any>();
    public readonly onAdPlanReceived = new Observable1<number>();

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
    private _rawResponse: string | undefined;
    private _parsedResponse: any;
    private _parserMap: { [key: string]: CampaignParser };

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._assetManager = assetManager;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._metaDataManager = metaDataManager;
        this._parserMap = {};
        this._requesting = false;
    }

    public request(): Promise<INativeResponse | void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        this._assetManager.enableCaching();

        this._requesting = true;

        if(this._rawResponse) {
            delete this._rawResponse;
        }

        if(this._parsedResponse) {
            delete this._parsedResponse;
        }

        return this._sessionManager.create().then((session) => {
            return Promise.all([this.createRequestUrl(session), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
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
                        this._rawResponse = response.response;
                        return this.parseCampaigns(response, session);
                    }
                    throw new WebViewError('Empty campaign response', 'CampaignRequestError');
                }).then(() => {
                    this._requesting = false;
                }).catch((error) => {
                    this._requesting = false;
                    return this.handleError(error, this._configuration.getPlacementIds());
                });
            });
        });
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    private parseCampaigns(response: INativeResponse, session: Session): Promise<void[]> {
        const json = this._parsedResponse = JsonParser.parse(response.response);
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
                promises.push(this.handleNoFill(placement));
                refreshDelay = CampaignRefreshManager.NoFillDelay;
            }

            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    let auctionResponse: AuctionResponse;
                    try {
                        auctionResponse = new AuctionResponse(fill[mediaId], json.media[mediaId], json.correlationId);
                        promises.push(this.handleCampaign(auctionResponse, session).catch(error => {
                            if(error === CacheStatus.STOPPED) {
                                return Promise.resolve();
                            }

                            return this.handleError(error, fill[mediaId]);
                        }));

                        // todo: the only reason to calculate ad plan behavior like this is to match the old yield ad plan behavior, this should be refactored in the future
                        const contentType = json.media[mediaId].contentType;
                        const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                        if(contentType && contentType !== 'comet/campaign' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                            refreshDelay = cacheTTL;
                        }
                    } catch(error) {
                        this.handleError(error, fill[mediaId]);
                    }
                }
            }

            this.onAdPlanReceived.trigger(refreshDelay);

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
                parser = this.getCampaignParser(CometCampaignParser, response);
                break;
            case 'programmatic/vast':
                parser = this.getCampaignParser(ProgrammaticVastParser, response);
                break;
            case 'programmatic/mraid-url':
                parser = this.getCampaignParser(ProgrammaticMraidUrlParser, response);
                break;
            case 'programmatic/mraid':
                parser = this.getCampaignParser(ProgrammaticMraidParser, response);
                break;
            case 'programmatic/static-interstitial':
                parser = this.getCampaignParser(ProgrammaticStaticInterstitialParser, response);
                break;
            default:
                throw new Error('Unsupported content-type: ' + response.getContentType());
        }

        // Update session to existing parser
        parser.setSession(session);

        return parser.parse(this._nativeBridge, this._request).then((campaign) => {
            return this.setupCampaignAssets(response.getPlacements(), campaign);
        });
    }

    private getCampaignParser<T extends CampaignParser>(CampaignParserConstructor: { new(response: AuctionResponse, gamerId: string, abGroup: number): T; }, response: AuctionResponse): CampaignParser {
        if(!this._parserMap[response.getContentType()]) {
            const campaignParser: T = new CampaignParserConstructor(response, this._configuration.getGamerId(), this.getAbGroup());
            this._parserMap[response.getContentType()] = campaignParser;
        }

        return this._parserMap[response.getContentType()];
    }

    private setupCampaignAssets(placements: string[], campaign: Campaign): Promise<void> {
        return this._assetManager.setup(campaign).then(() => {
            for(const placement of placements) {
                this.onCampaign.trigger(placement, campaign);
            }
        });
    }

    private handleNoFill(placement: string): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onNoFill.trigger(placement);
        return Promise.resolve();
    }

    private handleError(error: any, placementIds: string[]): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error, placementIds, this._rawResponse, this._parsedResponse);

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

    private createRequestUrl(session: Session): Promise<string> {
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
            auctionId: session.getId(),
            deviceMake: this._deviceInfo.getManufacturer(),
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            screenSize: this._deviceInfo.getScreenLayout(),
            stores: this._deviceInfo.getStores()
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

    private createRequestBody(): Promise<any> {
        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());
        promises.push(this.getFullyCachedCampaigns());

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            coppa: this._configuration.isCoppaCompliant(),
            language: this._deviceInfo.getLanguage(),
            gameSessionId: this._sessionManager.getGameSessionId(),
            timeZone: this._deviceInfo.getTimeZone()
        };

        if (this.getPreviousPlacementId()) {
            body.previousPlacementId = this.getPreviousPlacementId();
        }

        if(typeof navigator !== 'undefined' && navigator.userAgent && typeof navigator.userAgent === 'string') {
            body.webviewUa = navigator.userAgent;
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, fullyCachedCampaignIds]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;

            if (fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) {
                body.cachedCampaigns = fullyCachedCampaignIds;
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

                const placements = this._configuration.getPlacements();
                for(const placement in placements) {
                    if(placements.hasOwnProperty(placement)) {
                        placementRequest[placement] = {
                            adTypes: placements[placement].getAdTypes(),
                            allowSkip: placements[placement].allowSkip()
                        };
                    }
                }

                body.placements = placementRequest;
                body.properties = this._configuration.getProperties();

                return body;
            });
        });
    }

    private getFullyCachedCampaigns(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }
}
