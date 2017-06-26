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

export abstract class CampaignManager {

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

    protected static CampaignResponse: string | undefined;

    protected static AbGroup: number | undefined;
    private static CampaignId: string | undefined;
    private static Country: string | undefined;

    public readonly onCampaign = new Observable2<string, Campaign>();
    public readonly onNoFill = new Observable1<string>();
    public readonly onError = new Observable1<WebViewError>();

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
            });
        });
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    protected abstract getBaseUrl(): string;

    protected sendNegativeTargetingEvent(campaign: PerformanceCampaign, gamerId: string) {
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

    protected getParameter(field: string, value: any, expectedType: string) {
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

    protected parseVastCampaignHelper(content: any, gamerId: string, abGroup: number, trackingUrls?: { [eventName: string]: string[] }, cacheTTL?: number): Promise<VastCampaign> {
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

    protected getProgrammaticCampaignId(): string {
        switch(this._nativeBridge.getPlatform()) {
            case Platform.IOS:
                return '00005472656d6f7220694f53';
            case Platform.ANDROID:
                return '005472656d6f7220416e6472';
            default:
                return 'UNKNOWN';
        }
    }

    protected createRequestUrl(): Promise<string> {
        let url: string = this.getBaseUrl();

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

        return Promise.all(promises).then(([screenWidth, screenHeight, connectionType, networkType]) => {
            url = Url.addParameters(url, {
                screenWidth: this.getParameter('screenWidth', screenWidth, 'number'),
                screenHeight: this.getParameter('screenHeight', screenHeight, 'number'),
                connectionType: this.getParameter('connectionType', connectionType, 'string'),
                networkType: this.getParameter('networkType', networkType, 'number'),
            });

            return url;
        });
    }

    protected createRequestBody(): Promise<any> {
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

        if(this.getPreviousPlacementId()) {
            body.previousPlacementId = this.getPreviousPlacementId();
        }

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            body.webviewUa = this.getParameter('webviewUa', navigator.userAgent, 'string');
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, fullyCachedCampaignIds]) => {
            body.deviceFreeSpace = this.getParameter('deviceFreeSpace', freeSpace, 'number');
            body.networkOperator = this.getParameter('networkOperator', networkOperator, 'string');
            body.networkOperatorName = this.getParameter('networkOperatorName', networkOperatorName, 'string');

            if(fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) {
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
