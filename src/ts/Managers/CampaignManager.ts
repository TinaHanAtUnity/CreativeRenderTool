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

export class CampaignManager {

    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';

    public onCampaign: Observable1<Campaign> = new Observable1();
    public onVastCampaign: Observable1<Campaign> = new Observable1();
    public onNoFill: Observable1<number> = new Observable1();
    public onError: Observable1<Error> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vastParser: VastParser;

    public static setTestBaseUrl(baseUrl: string): void {
        CampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

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
                let campaignJson: any = JSON.parse(response.response);
                if (campaignJson.campaign) {
                    this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement');
                    let campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
                    this.onCampaign.trigger(campaign);
                } else if('vast' in campaignJson) {
                    if (campaignJson.vast === null) {
                        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
                        this.onNoFill.trigger(3600);
                    } else {
                        this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement');
                        this._vastParser.retrieveVast(campaignJson.vast, this._request).then(vast => {
                            let campaignId: string = undefined;
                            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                                campaignId = '00005472656d6f7220694f53';
                            } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                                campaignId = '005472656d6f7220416e6472';
                            }
                            let campaign = new VastCampaign(vast, campaignId, campaignJson.gamerId, campaignJson.abGroup);
                            if (campaign.getVast().getImpressionUrls().length === 0) {
                                this.onError.trigger(new Error('Campaign does not have an impression url'));
                                return;
                            }
                            // todo throw an Error if required events are missing. (what are the required events?)
                            if (campaign.getVast().getErrorURLTemplates().length === 0) {
                                this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
                            }
                            if (!campaign.getVideoUrl()) {
                                this.onError.trigger(new Error('Campaign does not have a video url'));
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
            sdkVersion: this._clientInfo.getSdkVersion()
        });

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            url = Url.addParameters(url, {
                webviewUa: encodeURIComponent(navigator.userAgent)
            });
        }

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

        let promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());

        return Promise.all(promises).then(([connectionType, networkType]) => {
            url = Url.addParameters(url, {
                connectionType: connectionType,
                networkType: networkType,
                screenSize: this._deviceInfo.getScreenLayout()
            });
            return url;
        });
    }

    private createRequestBody(): Promise<string> {
        let promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());

        let body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            language: this._deviceInfo.getLanguage(),
            timeZone: this._deviceInfo.getTimeZone(),
        };

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;

            return MetaDataManager.fetchMediationMetaData(this._nativeBridge).then(mediation => {
                if(mediation) {
                    body.mediation = mediation.getDTO();
                }

                return JSON.stringify(body);
            });
        });
    }



}
