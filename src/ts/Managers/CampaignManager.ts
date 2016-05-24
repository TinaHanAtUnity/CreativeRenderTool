import { Observable1 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';

export class CampaignManager {

    private static CampaignBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    public onCampaign: Observable1<Campaign> = new Observable1();
    public onNoFill: Observable1<number> = new Observable1();
    public onError: Observable1<Error> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    public request(): void {
        this.createRequestBody().then(requestBody => {
            return this._request.post(this.createRequestUrl(), requestBody, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                let campaignJson: any = JSON.parse(response.response);
                if(campaignJson.campaign) {
                    let campaign: Campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
                    this.onCampaign.trigger(campaign);
                } else {
                    this.onNoFill.trigger(3600); // Default to retry in one hour. This value should be set by server.
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
