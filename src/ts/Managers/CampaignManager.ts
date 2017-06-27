import { Observable0, Observable1, Observable2 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Request, INativeResponse } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { StorageType } from 'Native/Api/Storage';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { AssetManager } from 'Managers/AssetManager';
import { WebViewError } from 'Errors/WebViewError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { HttpKafka } from 'Utilities/HttpKafka';
import { SessionManager } from 'Managers/SessionManager';

export class CampaignManager {

    public static setTestBaseUrl(baseUrl: string): void {
        CampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

    public static setAuctionBaseUrl(baseUrl: string): void {
        CampaignManager.AuctionBaseUrl = baseUrl + '/v4/games';
    }

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

    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';
    private static AuctionBaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';
    private static AbGroup: number | undefined;
    private static CampaignId: string | undefined;
    private static Country: string | undefined;
    private static CampaignResponse: string | undefined;

    public readonly onPerformanceCampaign = new Observable1<PerformanceCampaign>();
    public readonly onVastCampaign = new Observable1<VastCampaign>();
    public readonly onMRAIDCampaign = new Observable1<MRAIDCampaign>();
    public readonly onNoFill = new Observable0();
    public readonly onError = new Observable1<WebViewError>();

    public readonly onPlcCampaign = new Observable2<string, Campaign>();
    public readonly onPlcNoFill = new Observable1<string>();
    public readonly onPlcError = new Observable1<WebViewError>();

    private _nativeBridge: NativeBridge;
    private _configuration: Configuration;
    private _assetManager: AssetManager;
    private _sessionManager: SessionManager;
    private _metaDataManager: MetaDataManager;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vastParser: VastParser;
    private _requesting: boolean;
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

    public request(): Promise<void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }

        this._assetManager.enableCaching();

        this._requesting = true;

        return Promise.all([this.createRequestUrl(), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            return this._request.post(requestUrl, requestBody, [], {
                retries: 2,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: true
            });
        }).then(response => {
            if(this._configuration.isAuction()) {
                return this.parsePlcCampaigns(response);
            } else {
                return this.parseCampaign(response);
            }
        }).then(() => {
            this._requesting = false;
        }).catch((error) => {
            this._requesting = false;
            if(this._configuration.isAuction()) {
                this.onPlcError.trigger(error);
            } else {
                this.onError.trigger(error);
            }
        });
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    private parseCampaign(response: INativeResponse) {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);
        if(json.gamerId) {
            this.storeGamerId(json.gamerId);
        } else if('campaign' in json || 'vast' in json || 'mraid' in json) {
            this._nativeBridge.Sdk.logError('Unity Ads server returned a campaign without gamerId, ignoring campaign');
            const error: DiagnosticError = new DiagnosticError(new Error('Missing gamerId'), {
                rawAdPlan: json
            });
            this.onError.trigger(error);
            return Promise.resolve();
        }

        if('campaign' in json) {
            return this.parsePerformanceCampaign(json);
        } else if('vast' in json) {
            return this.parseVastCampaign(json);
        } else if('mraid' in json) {
            return this.parseMraidCampaign(json);
        } else {
            return this.handleNoFill();
        }
    }

    private parsePlcCampaigns(response: INativeResponse) {
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

            let chain = Promise.resolve();

            for(const placement of noFill) {
                chain = chain.then(() => {
                    return this.handlePlcNoFill(placement);
                });
            }

            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    chain = chain.then(() => {
                        return this.handlePlcCampaign(fill[mediaId], json.media[mediaId].contentType, json.media[mediaId].content, json.media[mediaId].trackingUrls);
                    });
                }
            }

            return chain.catch(error => {
                return this.handlePlcError(error);
            });
        } else {
            return this.handlePlcError(new Error('No placements found'));
        }
    }

    private handlePlcCampaign(placements: string[], contentType: string, content: string, trackingUrls?: { [eventName: string]: string[] }): Promise<void> {
        const abGroup: number = this._configuration.getAbGroup();
        const gamerId: string = this._configuration.getGamerId();

        this._nativeBridge.Sdk.logDebug('Parsing PLC campaign ' + contentType + ': ' + content);
        switch (contentType) {
            case 'comet/campaign':
                const json = JsonParser.parse(content);
                if(json && json.mraidUrl) {
                    const campaign = new MRAIDCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, json.mraidUrl);
                    return this.setupPlcCampaignAssets(placements, campaign);
                } else {
                    const campaign = new PerformanceCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup);
                    this.sendNegativeTargetingEvent(campaign, gamerId);
                    return this.setupPlcCampaignAssets(placements, campaign);
                }

            case 'programmatic/vast':
                return this.parseVastCampaignHelper(content, gamerId, abGroup, trackingUrls).then((vastCampaign) => {
                    return this.setupPlcCampaignAssets(placements, vastCampaign);
                });

            case 'programmatic/mraid-url':
                const jsonMraidUrl = JsonParser.parse(content);
                jsonMraidUrl.id = this.getProgrammaticCampaignId();
                const mraidUrlCampaign = new MRAIDCampaign(jsonMraidUrl, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, jsonMraidUrl.inlinedUrl, undefined, trackingUrls);
                return this.setupPlcCampaignAssets(placements, mraidUrlCampaign);

            case 'programmatic/mraid':
                const jsonMraid = JsonParser.parse(content);
                jsonMraid.id = this.getProgrammaticCampaignId();
                const mraidCampaign = new MRAIDCampaign(jsonMraid, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, undefined, jsonMraid.markup, trackingUrls);
                return this.setupPlcCampaignAssets(placements, mraidCampaign);

            default:
                return this.handlePlcError(new Error('Unsupported content-type: ' + contentType));
        }

    }

    private setupPlcCampaignAssets(placements: string[], campaign: Campaign): Promise<void> {
        return this._assetManager.setup(campaign, true).then(() => {
            for(const placement of placements) {
                this.onPlcCampaign.trigger(placement, campaign);
            }
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

    private handlePlcNoFill(placement: string): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onPlcNoFill.trigger(placement);
        return Promise.resolve();
    }

    private handlePlcError(error: any): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        this.onPlcError.trigger(error);
        return Promise.resolve();
    }

    private parsePerformanceCampaign(json: any): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement for AB Group ' + json.abGroup);

        // json.campaign.mraidUrl = 'http://10.35.4.250:8000/index.html'
        // json.campaign.mraidUrl = 'https://cdn.unityads.unity3d.com/playables/staging/ios/abblast_hand_animation/index.html'
        
        if(json.campaign && json.campaign.mraidUrl) {
            const campaign = new MRAIDCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.campaign.mraidUrl);
            return this._assetManager.setup(campaign).then(() => this.onMRAIDCampaign.trigger(campaign));
        } else {
            const campaign = new PerformanceCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup);
            this.sendNegativeTargetingEvent(campaign, json.gamerId);
            return this._assetManager.setup(campaign).then(() => this.onPerformanceCampaign.trigger(campaign));
        }
    }

    private parseVastCampaign(json: any): Promise<void> {
        if(json.vast === null) {
            return this.handleNoFill();
        }
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement for AB Group ' + json.abGroup);
        return this.parseVastCampaignHelper(json.vast.data, json.gamerId, json.abGroup, json.vast.tracking, json.cacheTTL).then(campaign => {
            return this._assetManager.setup(campaign).then(() => this.onVastCampaign.trigger(campaign));
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private parseVastCampaignHelper(content: any, gamerId: string, abGroup: number, trackingUrls?: { [eventName: string]: string[] }, cacheTTL?: number ): Promise<VastCampaign> {
        const decodedVast = decodeURIComponent(content).trim();
        return this._vastParser.retrieveVast(decodedVast, this._nativeBridge, this._request).then(vast => {
            const campaignId = this.getProgrammaticCampaignId();
            const campaign = new VastCampaign(vast, campaignId, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, cacheTTL, trackingUrls);
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
                this.onError.trigger(videoUrlError);
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

    private parseMraidCampaign(json: any): Promise<void> {
        if(json.mraid === null) {
            return this.handleNoFill();
        }
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement for AB Group ' + json.abGroup);

        json.mraid.id = this.getProgrammaticCampaignId();

        if(json.mraid.inlinedURL || json.mraid.markup) {
            const campaign = new MRAIDCampaign(json.mraid, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.mraid.inlinedURL, json.mraid.markup, json.mraid.tracking);
            return this._assetManager.setup(campaign).then(() => this.onMRAIDCampaign.trigger(campaign));
        } else {
            const MRAIDUrlError = new DiagnosticError(
                new Error('MRAID Campaign missing markup'),
                {mraid: json.mraid}
            );
            this.onError.trigger(MRAIDUrlError);
            return Promise.resolve();
        }
    }

    private handleNoFill(): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.onNoFill.trigger();
        return Promise.resolve();
    }

    private createRequestUrl(): Promise<string> {
        let url: string;

        if(this._configuration.isAuction()) {
            url = [
                CampaignManager.AuctionBaseUrl,
                this._clientInfo.getGameId(),
                'requests'
            ].join('/');
        } else {
            url = [
                CampaignManager.CampaignBaseUrl,
                this._clientInfo.getGameId(),
                'fill'
            ].join('/');
        }

        if(this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this.getParameter('advertisingTrackingId', this._deviceInfo.getAdvertisingIdentifier(), 'string'),
                limitAdTracking: this.getParameter('limitAdTracking', this._deviceInfo.getLimitAdTracking(), 'boolean')
            });
        } else if(this._clientInfo.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: this.getParameter('androidId', this._deviceInfo.getAndroidId(), 'string')
            });
        }

        url = Url.addParameters(url, {
            deviceMake: this.getParameter('deviceMake', this._deviceInfo.getManufacturer(), 'string'),
            deviceModel: this.getParameter('deviceModel', this._deviceInfo.getModel(), 'string'),
            platform: this.getParameter('platform', Platform[this._clientInfo.getPlatform()].toLowerCase(), 'string'),
            screenDensity: this.getParameter('screenDensity', this._deviceInfo.getScreenDensity(), 'number'),
            sdkVersion: this.getParameter('sdkVersion', this._clientInfo.getSdkVersion(), 'number'),
            screenSize: this.getParameter('screenSize', this._deviceInfo.getScreenLayout(), 'number'),
            stores: this.getParameter('stores', this._deviceInfo.getStores(), 'string')
        });

        if(this._clientInfo.getPlatform() === Platform.IOS) {
            url = Url.addParameters(url, {
                osVersion: this.getParameter('osVersion', this._deviceInfo.getOsVersion(), 'string')
            });
        } else {
            url = Url.addParameters(url, {
                apiLevel: this.getParameter('apiLevel', this._deviceInfo.getApiLevel(), 'number')
            });
        }

        if(this._clientInfo.getTestMode()) {
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
        promises.push(this.fetchGamerId());

        return Promise.all(promises).then(([screenWidth, screenHeight, connectionType, networkType, gamerId]) => {
            url = Url.addParameters(url, {
                screenWidth: this.getParameter('screenWidth', screenWidth, 'number'),
                screenHeight: this.getParameter('screenHeight', screenHeight, 'number'),
                connectionType: this.getParameter('connectionType', connectionType, 'string'),
                networkType: this.getParameter('networkType', networkType, 'number'),
            });

            if(this._configuration.isAuction()) {
                // todo: it's slightly wasteful to read gamerId from storage and then ignore the value
                url = Url.addParameters(url, {
                    gamerId: this.getParameter('gamerId', this._configuration.getGamerId(), 'string')
                });
            } else if(gamerId) {
                url = Url.addParameters(url, {
                    gamerId: this.getParameter('gamerId', gamerId, 'string')
                });
            }

            return url;
        });
    }

    private createRequestBody(): Promise<string> {
        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());
        promises.push(this.getFullyCachedCampaigns());

        const body: any = {
            bundleVersion: this.getParameter('bundleVersion', this._clientInfo.getApplicationVersion(), 'string'),
            bundleId: this.getParameter('bundleId', this._clientInfo.getApplicationName(), 'string'),
            coppa: this.getParameter('coppa', this._configuration.isCoppaCompliant(), 'boolean'),
            language: this.getParameter('language', this._deviceInfo.getLanguage(), 'string'),
            gameSessionId: this.getParameter('sessionId', this._sessionManager.getGameSessionId(), 'number'),
            timeZone: this.getParameter('timeZone', this._deviceInfo.getTimeZone(), 'string')
        };

        if (this.getPreviousPlacementId()) {
            body.previousPlacementId = this.getPreviousPlacementId();
        }

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            body.webviewUa = this.getParameter('webviewUa', navigator.userAgent, 'string');
        }

        if(this._configuration.isAuction()) {
            const placementRequest: any = {};

            const placements = this._configuration.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    placementRequest[placement] = {
                        adTypes: placements[placement].getAdTypes()
                    };
                }
            }

            body.placements = placementRequest;
            body.properties = this._configuration.getProperties();
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, fullyCachedCampaignIds]) => {
            body.deviceFreeSpace = this.getParameter('deviceFreeSpace', freeSpace, 'number');
            body.networkOperator = this.getParameter('networkOperator', networkOperator, 'string');
            body.networkOperatorName = this.getParameter('networkOperatorName', networkOperatorName, 'string');

            if (fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) {
                body.cachedCampaigns = fullyCachedCampaignIds;
            }

            const metaDataPromises: Array<Promise<any>> = [];
            metaDataPromises.push(this._metaDataManager.fetch(MediationMetaData));
            metaDataPromises.push(this._metaDataManager.fetch(FrameworkMetaData));

            return Promise.all(metaDataPromises).then(([mediation, framework]) => {
                if(mediation) {
                    body.mediationName = this.getParameter('mediationName', mediation.getName(), 'string');
                    body.mediationVersion = this.getParameter('mediationVersion', mediation.getVersion(), 'string');
                    if(mediation.getOrdinal()) {
                        body.mediationOrdinal = this.getParameter('mediationOrdinal', mediation.getOrdinal(), 'number');
                    }
                }

                if(framework) {
                    body.frameworkName = this.getParameter('frameworkName', framework.getName(), 'string');
                    body.frameworkVersion = this.getParameter('frameworkVersion', framework.getVersion(), 'string');
                }

                return JSON.stringify(body);
            });
        });
    }

    private fetchGamerId(): Promise<string> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'gamerId').then(gamerId => {
            return gamerId;
        }).catch(error => {
            return undefined;
        });
    }

    private storeGamerId(gamerId: string): Promise<void[]> {
        return Promise.all([
            this._nativeBridge.Storage.set(StorageType.PRIVATE, 'gamerId', gamerId),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private sendNegativeTargetingEvent(campaign: PerformanceCampaign, gamerId: string) {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return;
        }

        this._nativeBridge.DeviceInfo.Android.isAppInstalled(campaign.getAppStoreId()).then(installed => {
            if(installed) {
                const msg: any = {
                    ts: Date.now(),
                    gamerId: gamerId,
                    campaignId: campaign.getId(),
                    targetBundleId: campaign.getAppStoreId(),
                    targetGameId: campaign.getGameId(),
                    coppa: this._configuration.isCoppaCompliant()
                };

                HttpKafka.sendEvent('events.negtargeting.json', msg);
            }
        });
    }

    private getFullyCachedCampaigns(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }

    private getParameter(field: string, value: any, expectedType: string) {
        if(value === undefined) {
            return undefined;
        }

        if(typeof value === expectedType) {
            return value;
        } else {
            Diagnostics.trigger('internal_type_error', {
                context: 'campaign_request',
                field: field,
                value: JSON.stringify(value),
                expectedType: expectedType,
                observedType: typeof value
            });

            if(expectedType === 'string') {
                return '';
            }

            if(expectedType === 'number') {
                return 0;
            }

            if(expectedType === 'boolean') {
                return false;
            }

            // we only use string, number and boolean so this code is not reachable
            return value;
        }
    }
}
