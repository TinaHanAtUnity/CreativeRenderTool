import { Observable1 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { VastParser } from 'Utilities/VastParser';

export class CampaignManager {

    private static CampaignBaseUrl = 'http://staging.applifier.info:7003/test/games';

    public onCampaign: Observable1<Campaign> = new Observable1();
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
        return this.createRequestBody().then(requestBody => {
            console.log(`got request body: ${requestBody} requestUrl: ${this.createRequestUrl()}`);
            return this._request.post(this.createRequestUrl(), requestBody, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: false
            }).then(response => {
                let campaignJson: any = JSON.parse(response.response);
                let campaign: Campaign;
                if (campaignJson.campaign) {
                    campaign = new Campaign({campaign: campaignJson.campaign}, campaignJson.gamerId, campaignJson.abGroup);
                    this.onCampaign.trigger(campaign);
                } else {
                    this._vastParser.retrieveVast(campaignJson.vast, this._request).then(vast => {
                        campaign = new Campaign({vast: vast}, campaignJson.gamerId, campaignJson.abGroup);
                        if (campaign.getVast().getImpressionUrls().length === 0) {
                            this.onError.trigger(new Error('Campaign does not have an impression url'));
                        }
                        // todo throw an Error if required events are missing. (what are the required events?)
                        if (campaign.getVast().getErrorURLTemplates().length === 0) {
                            this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
                        }
                        if (!campaign.getVideoUrl()) {
                            this.onError.trigger(new Error('Campaign does not have a video url'));
                        }
                        this.onCampaign.trigger(campaign);
                    }).catch((error) => {
                        this.onError.trigger(error);
                    });
                }
            });
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private createRequestUrl(): string {
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
            connectionType: this._deviceInfo.getConnectionType(),
            deviceMake: this._deviceInfo.getManufacturer(),
            deviceModel: this._deviceInfo.getModel(),
            networkType: this._deviceInfo.getNetworkType(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenSize: this._deviceInfo.getScreenLayout(),
            screenWidth: this._deviceInfo.getScreenWidth(),
            screenHeight: this._deviceInfo.getScreenHeight(),
            sdkVersion: this._clientInfo.getSdkVersion()
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

        return url;
    }

    private createRequestBody(): Promise<string> {
        return MediationMetaData.fetch(this._nativeBridge).then(mediation => {
            let body: any = {
                bundleVersion: this._clientInfo.getApplicationVersion(),
                bundleId: this._clientInfo.getApplicationName(),
                deviceFreeSpace: this._deviceInfo.getFreeSpace(),
                language: this._deviceInfo.getLanguage(),
                networkOperator: this._deviceInfo.getNetworkOperator(),
                networkOperatorName: this._deviceInfo.getNetworkOperatorName(),
                timeZone: this._deviceInfo.getTimeZone()
            };

            if(mediation) {
                body.mediation = mediation.getDTO();
            }

            return JSON.stringify(body);
        });
    }

}
