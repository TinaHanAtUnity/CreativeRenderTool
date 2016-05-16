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
    public onError: Observable1<Error> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _failedPlacements: string[];

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._failedPlacements = [];
    }

    public request(): void {
        this.createRequestUrl().then(requestUrl => {
            return this._request.get(requestUrl, [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).then(response => {
                let campaignJson: any = JSON.parse(response.response);
                let campaign: Campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
                this.onCampaign.trigger(campaign);
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

        return MediationMetaData.fetch(this._nativeBridge).then(mediation => {
            url = Url.addParameters(url, {
                bundleVersion: this._clientInfo.getApplicationVersion(),
                bundleId: this._clientInfo.getApplicationName(),
                connectionType: this._deviceInfo.getConnectionType(),
                deviceFreeSpace: this._deviceInfo.getFreeSpace(),
                gameId: this._clientInfo.getGameId(),
                hardwareVersion: this._deviceInfo.getManufacturer() + ' ' + this._deviceInfo.getModel(),
                deviceType: this._deviceInfo.getModel(),
                language: this._deviceInfo.getLanguage(),
                networkType: this._deviceInfo.getNetworkType(),
                networkOperator: this._deviceInfo.getNetworkOperator(),
                networkOperatorName: this._deviceInfo.getNetworkOperatorName(),
                platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
                screenDensity: this._deviceInfo.getScreenDensity(),
                screenSize: this._deviceInfo.getScreenLayout(),
                screenWidth: this._deviceInfo.getScreenWidth(),
                screenHeight: this._deviceInfo.getScreenHeight(),
                sdkVersion: this._clientInfo.getSdkVersion(),
                softwareVersion: this._deviceInfo.getApiLevel(),
                timeZone: this._deviceInfo.getTimeZone()
            });

            if(this._deviceInfo.getAdvertisingIdentifier()) {
                url = Url.addParameters(url, {
                    advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                    limitAdTracking: this._deviceInfo.getLimitAdTracking()
                });
            } else {
                url = Url.addParameters(url, {
                    androidId: this._deviceInfo.getAndroidId()
                });
            }

            if(this._clientInfo.getTestMode()) {
                url = Url.addParameters(url, {test: true});
            }

            if(mediation) {
                url = Url.addParameters(url, mediation.getDTO());
            }

            return url;
        });
    }

}
