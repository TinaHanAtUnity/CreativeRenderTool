import { Observable1 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { StorageType } from 'Native/Api/Storage';
import { HtmlCampaign } from 'Models/HtmlCampaign';

export class CampaignManager {

    public static setTestBaseUrl(baseUrl: string): void {
        CampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: number) {
        CampaignManager.AbGroup = abGroup;
    }

    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';
    private static AbGroup: number | undefined;

    public onCampaign: Observable1<Campaign> = new Observable1();
    public onVastCampaign: Observable1<Campaign> = new Observable1();
    public onThirdPartyCampaign: Observable1<HtmlCampaign> = new Observable1();
    public onNoFill: Observable1<number> = new Observable1();
    public onError: Observable1<Error> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vastParser: VastParser;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._vastParser = vastParser;
    }

    public request(): Promise<void> {
        return Promise.all([this.createRequestUrl(), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            return this._request.post(requestUrl, requestBody, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                const campaignJson: any = JsonParser.parse(response.response);
                if(campaignJson.gamerId) {
                    this.storeGamerId(campaignJson.gamerId);
                }
                if (campaignJson.campaign) {
                    this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement');
                    /*let campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
                    this.onCampaign.trigger(campaign);*/
                    const resource = this._nativeBridge.getPlatform() === Platform.ANDROID ? 'https://static.applifier.com/playables/SMA_android/index_android.html' : 'https://static.applifier.com/playables/SMA_ios/index_ios.html';
                    const campaign = new HtmlCampaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup, resource);
                    this.onThirdPartyCampaign.trigger(campaign);
                } else if('vast' in campaignJson) {
                    if (campaignJson.vast === null) {
                        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
                        this.onNoFill.trigger(3600);
                    } else {
                        this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement');
                        const decodedVast = decodeURIComponent(campaignJson.vast.data).trim();
                        this._vastParser.retrieveVast(decodedVast, this._nativeBridge, this._request).then(vast => {
                            let campaignId: string;
                            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                                campaignId = '00005472656d6f7220694f53';
                            } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                                campaignId = '005472656d6f7220416e6472';
                            } else {
                                campaignId = 'UNKNOWN';
                            }
                            const campaign = new VastCampaign(vast, campaignId, campaignJson.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : campaignJson.abGroup, campaignJson.cacheTTL);
                            if (campaign.getVast().getImpressionUrls().length === 0) {
                                this.onError.trigger(new Error('Campaign does not have an impression url'));
                                return;
                            }
                            // todo throw an Error if required events are missing. (what are the required events?)
                            if (campaign.getVast().getErrorURLTemplates().length === 0) {
                                this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
                            }
                            if (!campaign.getVideoUrl()) {
                                const videoUrlError = new DiagnosticError(
                                    new Error('Campaign does not have a video url'),
                                    { rootWrapperVast: campaignJson.vast }
                                );
                                this.onError.trigger(videoUrlError);
                                return;
                            }
                            this.onVastCampaign.trigger(campaign);
                        }).catch((error) => {
                            this.onError.trigger(error);
                        });
                    }
                } else {
                    this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
                    this.onNoFill.trigger(3600); // default to retry in one hour, this value should be set by server
                }
            });
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private createRequestUrl(): Promise<string> {
        let url: string = [
            CampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'fill'
        ].join('/');

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
            screenWidth: this._deviceInfo.getScreenWidth(),
            screenHeight: this._deviceInfo.getScreenHeight(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            screenSize: this._deviceInfo.getScreenLayout()
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

        if(this._clientInfo.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        const promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());
        promises.push(this.fetchGamerId());

        return Promise.all(promises).then(([connectionType, networkType, gamerId]) => {
            url = Url.addParameters(url, {
                connectionType: connectionType,
                networkType: networkType,
                gamerId: gamerId
            });

            return url;
        });
    }

    private createRequestBody(): Promise<string> {
        const promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            language: this._deviceInfo.getLanguage(),
            timeZone: this._deviceInfo.getTimeZone(),
        };

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            body.webviewUa = navigator.userAgent;
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;

            return MetaDataManager.fetchMediationMetaData(this._nativeBridge).then(mediation => {
                if(mediation) {
                    body.mediationName = mediation.getName();
                    body.mediationVersion = mediation.getVersion();
                    if(mediation.getOrdinal()) {
                        body.mediationOrdinal = mediation.getOrdinal();
                    }
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

}
