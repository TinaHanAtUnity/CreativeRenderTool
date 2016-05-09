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

    public request(): Promise<void> {
        return this.createRequestUrl().then(requestUrl => {
            return this._request.get(requestUrl, [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).then(response => {
                let campaignJson: any = JSON.parse(response.response);
                let campaign: Campaign;
                if (campaignJson.campaign) {
                    campaign = new Campaign(campaignJson.gamerId, campaignJson.abGroup, {campaign: campaignJson.campaign});
                } else {
                    campaign = new Campaign(campaignJson.gamerId, campaignJson.abGroup, {vast: campaignJson.vast});
                    if (campaign.getVast().getImpressionUrls().length === 0) {
                        throw new Error('Campaign does not have an impression url');
                    }
                    // todo throw an Error if required events are missing. (what are the required events?)
                    if (campaign.getVast().getErrorURLTemplates().length === 0) {
                        this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
                    }
                }
                if (!campaign.getVideoUrl()) {
                    throw new Error('Campaign does not have a video url');
                }
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
