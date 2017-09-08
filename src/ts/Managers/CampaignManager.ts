import { Observable1, Observable2 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Request, INativeResponse } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { DiagnosticError } from 'Errors/DiagnosticError';
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
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Diagnostics } from 'Utilities/Diagnostics';

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
    public readonly onError = new Observable2<WebViewError, string[]>();
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
    private _vastParser: VastParser;
    private _previousPlacementId: string | undefined;

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser, metaDataManager: MetaDataManager) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._assetManager = assetManager;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._vastParser = vastParser;
        this._metaDataManager = metaDataManager;

        this._requesting = false;
    }

    public request(): Promise<INativeResponse | void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        this._assetManager.enableCaching();

        this._requesting = true;

        return Promise.all([this.createRequestUrl(), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            const body = JSON.stringify(requestBody);
            return this._request.post(requestUrl, body, [], {
                retries: 2,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                if(response) {
                    return this.parseCampaigns(response);
                }
                throw new WebViewError('Empty campaign response', 'CampaignRequestError');
            }).then(() => {
                this._requesting = false;
            }).catch((error) => {
                this._requesting = false;
                return this.handleError(error, this._configuration.getPlacementIds());
            });
        });
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    private parseCampaigns(response: INativeResponse) {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);

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
                    } catch(error) {
                        return this.handleError(error, fill[mediaId]);
                    }
                    promises.push(this.handleCampaign(auctionResponse).catch(error => {
                        if(error === CacheStatus.STOPPED) {
                            return Promise.resolve();
                        }

                        let diagnosticError = error;

                        if(diagnosticError instanceof Error) {
                            diagnosticError = { 'message': error.message, 'name': error.name, 'stack': error.stack };
                        }

                        // todo: this is overlapping with plc_request_failed so this should be refactored to not overlap
                        Diagnostics.trigger('handle_campaign_failed', {
                            error: diagnosticError,
                            contentType: json.media[mediaId].contentType,
                            content: json.media[mediaId].content,
                            cacheTTL: json.media[mediaId].cacheTTL,
                            trackingUrls: json.media[mediaId].trackingUrls,
                            adType: json.media[mediaId].adType,
                            creativeId: json.media[mediaId].creativeId,
                            seatId: json.media[mediaId].seatId,
                            correlationId: json.correlationId
                        });

                        return this.handleError(error, fill[mediaId]);
                    }));

                    // todo: the only reason to calculate ad plan behavior like this is to match the old yield ad plan behavior, this should be refactored in the future
                    const contentType = json.media[mediaId].contentType;
                    const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                    if(contentType && contentType !== 'comet/campaign' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                        refreshDelay = cacheTTL;
                    }
                }
            }

            this.onAdPlanReceived.trigger(refreshDelay);

            return Promise.all(promises).catch(error => {
                return this.handleError(error, this._configuration.getPlacementIds());
            });
        } else {
            return this.handleError(new Error('No placements found'), this._configuration.getPlacementIds());
        }
    }

    private handleCampaign(response: AuctionResponse): Promise<void> {
        const abGroup: number = this._configuration.getAbGroup();
        const gamerId: string = this._configuration.getGamerId();

        this._nativeBridge.Sdk.logDebug('Parsing PLC campaign ' + response.getContentType() + ': ' + response.getContent());
        switch (response.getContentType()) {
            case 'comet/campaign':
                const json = JsonParser.parse(response.getContent());
                if(json && json.mraidUrl) {
                    const campaign = new MRAIDCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, undefined, json.mraidUrl);
                    return this.setupCampaignAssets(response.getPlacements(), campaign);
                } else {
                    const campaign = new PerformanceCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup);
                    return this.setupCampaignAssets(response.getPlacements(), campaign);
                }

            case 'programmatic/vast':
                return this.parseVastCampaignHelper(response.getContent(), gamerId, abGroup, response.getTrackingUrls(), response.getCacheTTL(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId()).then((vastCampaign) => {
                    return this.setupCampaignAssets(response.getPlacements(), vastCampaign);
                });

            case 'programmatic/mraid-url':
                const jsonMraidUrl = JsonParser.parse(response.getContent());
                if(!jsonMraidUrl) {
                    return this.handleError(new Error('Corrupted mraid-url content'), response.getPlacements());
                }

                if(!jsonMraidUrl.inlinedUrl) {
                    const MRAIDError = new DiagnosticError(
                        new Error('MRAID Campaign missing inlinedUrl'),
                        {mraid: jsonMraidUrl}
                    );
                    return this.handleError(MRAIDError, response.getPlacements());
                }

                jsonMraidUrl.id = this.getProgrammaticCampaignId();
                const mraidUrlCampaign = new MRAIDCampaign(jsonMraidUrl, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, response.getCacheTTL(), jsonMraidUrl.inlinedUrl, undefined, response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId());
                return this.setupCampaignAssets(response.getPlacements(), mraidUrlCampaign);

            case 'programmatic/mraid':
                const jsonMraid = JsonParser.parse(response.getContent());
                if(!jsonMraid) {
                    return this.handleError(new Error('Corrupted mraid content'), response.getPlacements());
                }

                if(!jsonMraid.markup) {
                    const MRAIDError = new DiagnosticError(
                        new Error('MRAID Campaign missing markup'),
                        {mraid: jsonMraid}
                    );
                    return this.handleError(MRAIDError, response.getPlacements());
                }

                jsonMraid.id = this.getProgrammaticCampaignId();
                const markup = decodeURIComponent(jsonMraid.markup);
                const mraidCampaign = new MRAIDCampaign(jsonMraid, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, response.getCacheTTL(), undefined, markup, response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId());
                return this.setupCampaignAssets(response.getPlacements(), mraidCampaign);

            default:
                return this.handleError(new Error('Unsupported content-type: ' + response.getContentType()), response.getPlacements());
        }
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
        this.onError.trigger(error, placementIds);

        return Promise.resolve();
    }

    private getBaseUrl(): string {
        return [
            CampaignManager.BaseUrl,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }

    private parseVastCampaignHelper(content: any, gamerId: string, abGroup: number, trackingUrls?: { [eventName: string]: string[] }, cacheTTL?: number, adType?: string, creativeId?: string, seatId?: number, correlationId?: string): Promise<VastCampaign> {
        const decodedVast = decodeURIComponent(content).trim();
        return this._vastParser.retrieveVast(decodedVast, this._nativeBridge, this._request).then(vast => {
            const campaignId = this.getProgrammaticCampaignId();
            const campaign = new VastCampaign(vast, campaignId, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, cacheTTL, trackingUrls, adType, creativeId, seatId, correlationId);
            if(campaign.getVast().getImpressionUrls().length === 0) {
                return Promise.reject(new Error('Campaign does not have an impression url'));
            }
            // todo throw an Error if required events are missing. (what are the required events?)
            if(campaign.getVast().getErrorURLTemplates().length === 0) {
                this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
            }
            if(!campaign.getVideo().getUrl()) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign does not have a video url'),
                    {rootWrapperVast: content}
                );
                return Promise.reject(videoUrlError);
            }
            if(this._nativeBridge.getPlatform() === Platform.IOS && !campaign.getVideo().getUrl().match(/^https:\/\//)) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign video url needs to be https for iOS'),
                    {rootWrapperVast: content}
                );
                return Promise.reject(videoUrlError);
            }
            return Promise.resolve(campaign);
        });
    }

    private getProgrammaticCampaignId(): string {
        switch (this._nativeBridge.getPlatform()) {
            case Platform.IOS:
                return '00005472656d6f7220694f53';
            case Platform.ANDROID:
                return '005472656d6f7220416e6472';
            default:
                return 'UNKNOWN';
        }
    }

    private createRequestUrl(): Promise<string> {
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
