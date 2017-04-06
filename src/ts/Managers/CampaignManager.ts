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

export class CampaignManager {

    public static setTestBaseUrl(baseUrl: string): void {
        CampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

    public static setAuctionBaseUrl(baseUrl: string): void {
        CampaignManager.AuctionBaseUrl = baseUrl + '/v1/games'
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

    private static NoFillDelay = 3600;
    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';
    private static AuctionBaseUrl: string = 'https://auction.unityads.unity3d.com/v1/games';
    private static AbGroup: number | undefined;
    private static CampaignId: string | undefined;
    private static Country: string | undefined;
    private static CampaignResponse: string | undefined;

    public onPerformanceCampaign: Observable1<PerformanceCampaign> = new Observable1();
    public onVastCampaign: Observable1<VastCampaign> = new Observable1();
    public onMRAIDCampaign: Observable1<MRAIDCampaign> = new Observable1();
    public onNoFill: Observable1<number> = new Observable1();
    public onError: Observable1<WebViewError> = new Observable1();

    public onPlcCampaign: Observable2<string, Campaign> = new Observable2();
    public onPlcNoFill: Observable1<string> = new Observable1();
    public onPlcError: Observable1<WebViewError> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _configuration: Configuration;
    private _assetManager: AssetManager;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vastParser: VastParser;

    private _requesting: boolean;
    private _refillTimestamp: number;
    private _plcRefillTimestamp: number;

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._assetManager = assetManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._vastParser = vastParser;

        this._requesting = false;
        this._refillTimestamp = 0;
    }

    public request(): Promise<void> {
        // prevent having more then one ad request in flight
        if(this._requesting) {
            return Promise.resolve();
        }
        // prevent ad request until no fill delay has passed
        if(this._refillTimestamp !== 0 && Date.now() <= this._refillTimestamp) {
            return Promise.resolve();
        }
        this._requesting = true;
        this._refillTimestamp = 0;
        this._plcRefillTimestamp = 0;
        return Promise.all([this.createRequestUrl(), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            return this._request.post(requestUrl, requestBody, [], {
                retries: 2,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: true
            });
        }).then(response => {
            if(this._configuration.isPlacementLevelControl()) {
                return this.parsePlcCampaigns(response);
            } else {
                return this.parseCampaign(response);
            }
        }).then(() => {
            this._requesting = false;
        }).catch((error) => {
            this._requesting = false;
            this.onError.trigger(error);
        });
    }

    public shouldPlcRefill(): boolean {
        if(this._requesting) {
            return false;
        }

        if(this._plcRefillTimestamp !== 0 && Date.now() > this._plcRefillTimestamp) {
            return true;
        }

        return false;
    }

    private parseCampaign(response: INativeResponse) {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);
        if(json.gamerId) {
            this.storeGamerId(json.gamerId);
        }

        if('campaign' in json) {
            return this.parsePerformanceCampaign(json);
        } else if('vast' in json) {
            return this.parseVastCampaign(json);
        } else {
            return this.handleNoFill();
        }
    }

    private parsePlcCampaigns(response: INativeResponse) {
        // todo: for now, campaigns with placement level control are always refreshed after one hour regardless of response or errors
        this._plcRefillTimestamp = Date.now() + CampaignManager.NoFillDelay * 1000;

        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);

        if('placements' in json) {
            let chain = Promise.resolve();

            const placements = this._configuration.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    if(json.placements[placement]) {
                        chain = chain.then(() => {
                            // todo: this is lacking all json validation, just assuming the format is correct
                            return this.handlePlcCampaign(placement, json.media[json.placements[placement]].contentType, json.media[json.placements[placement]].payload);
                        });
                    } else {
                        chain = chain.then(() => {
                            return this.handlePlcNoFill(placement);
                        });
                    }
                }
            }

            return chain.catch(error => {
                return this.handlePlcError(error);
            });
        } else {
            return this.handlePlcError(new Error('No placements found'));
        }
    }

    private handlePlcCampaign(placement: string, contentType: string, payload: string): Promise<void> {
        const abGroup: number = this._configuration.getAbGroup();
        const gamerId: string = this._configuration.getGamerId();

        this._nativeBridge.Sdk.logDebug('Parsing PLC campaign for placement ' + placement + ' (' + contentType + '): ' + payload);
        if(contentType === 'comet/campaign') {
            const json = JsonParser.parse(payload);
            if(json && json.mraidUrl) {
                const campaign = new MRAIDCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, json.mraidUrl);
                return this._assetManager.setup(campaign).then(() => this.onPlcCampaign.trigger(placement, campaign));
            } else {
                const campaign = new PerformanceCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup);
                return this._assetManager.setup(campaign).then(() => this.onPlcCampaign.trigger(placement, campaign));
            }
        }

        return this.handlePlcError(new Error('Unsupported content-type: ' + contentType));
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
        if(json.campaign && json.campaign.mraidUrl) {
            const campaign = new MRAIDCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.campaign.mraidUrl);
            return this._assetManager.setup(campaign).then(() => this.onMRAIDCampaign.trigger(campaign));
        } else {
            const campaign = new PerformanceCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup);
            return this._assetManager.setup(campaign).then(() => this.onPerformanceCampaign.trigger(campaign));
        }
    }

    private parseVastCampaign(json: any): Promise<void> {
        if(json.vast === null) {
            return this.handleNoFill();
        }
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement for AB Group ' + json.abGroup);
        const decodedVast = decodeURIComponent(json.vast.data).trim();
        return this._vastParser.retrieveVast(decodedVast, this._nativeBridge, this._request).then(vast => {
            let campaignId: string;
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                campaignId = '00005472656d6f7220694f53';
            } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                campaignId = '005472656d6f7220416e6472';
            } else {
                campaignId = 'UNKNOWN';
            }
            const campaign = new VastCampaign(vast, campaignId, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.cacheTTL, json.vast.tracking);
            if(campaign.getVast().getImpressionUrls().length === 0) {
                this.onError.trigger(new Error('Campaign does not have an impression url'));
                return;
            }
            // todo throw an Error if required events are missing. (what are the required events?)
            if(campaign.getVast().getErrorURLTemplates().length === 0) {
                this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
            }
            if(!campaign.getVideo().getUrl()) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign does not have a video url'),
                    {rootWrapperVast: json.vast}
                );
                this.onError.trigger(videoUrlError);
                return;
            }
            if(this._nativeBridge.getPlatform() === Platform.IOS && !campaign.getVideo().getUrl().match(/^https:\/\//)) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign video url needs to be https for iOS'),
                    {rootWrapperVast: json.vast}
                );
                this.onError.trigger(videoUrlError);
                return;
            }
            return this._assetManager.setup(campaign).then(() => this.onVastCampaign.trigger(campaign));
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private handleNoFill(): Promise<void> {
        this._refillTimestamp = Date.now() + CampaignManager.NoFillDelay * 1000;
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.onNoFill.trigger(CampaignManager.NoFillDelay);
        return Promise.resolve();
    }

    private createRequestUrl(): Promise<string> {
        let url: string;

        if(this._configuration.isPlacementLevelControl()) {
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
            screenWidth: this.getParameter('screenWidth', this._deviceInfo.getScreenWidth(), 'number'),
            screenHeight: this.getParameter('screenHeight', this._deviceInfo.getScreenHeight(), 'number'),
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
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());
        promises.push(this.fetchGamerId());

        return Promise.all(promises).then(([connectionType, networkType, gamerId]) => {
            url = Url.addParameters(url, {
                connectionType: this.getParameter('connectionType', connectionType, 'string'),
                networkType: this.getParameter('networkType', networkType, 'number'),
            });

            if(this._configuration.isPlacementLevelControl()) {
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

        const body: any = {
            bundleVersion: this.getParameter('bundleVersion', this._clientInfo.getApplicationVersion(), 'string'),
            bundleId: this.getParameter('bundleId', this._clientInfo.getApplicationName(), 'string'),
            language: this.getParameter('language', this._deviceInfo.getLanguage(), 'string'),
            timeZone: this.getParameter('timeZone', this._deviceInfo.getTimeZone(), 'string')
        };

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            body.webviewUa = this.getParameter('webviewUa', navigator.userAgent, 'string');
        }

        if(this._configuration.isPlacementLevelControl()) {
            const placementRequest: any = {};

            const placements = this._configuration.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    placementRequest[placement] = {};
                }
            }

            body.placements = placementRequest;
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName]) => {
            body.deviceFreeSpace = this.getParameter('deviceFreeSpace', freeSpace, 'number');
            body.networkOperator = this.getParameter('networkOperator', networkOperator, 'string');
            body.networkOperatorName = this.getParameter('networkOperatorName', networkOperatorName, 'string');

            const metaDataPromises: Array<Promise<any>> = [];
            metaDataPromises.push(MetaDataManager.fetchMediationMetaData(this._nativeBridge));
            metaDataPromises.push(MetaDataManager.fetchFrameworkMetaData(this._nativeBridge));

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
