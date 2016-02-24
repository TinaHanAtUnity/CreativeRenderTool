import { Observable } from 'Utilities/Observable';

import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';

import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';

export class CampaignManager extends Observable {

    private static CampaignBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    constructor(request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        super();
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    public request(placement: Placement): void {
        this._request.get(this.createRequestUrl(placement.getId())).then(([response]) => {
            let campaignJson: any = JSON.parse(response);
            let campaign: Campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
            placement.setCampaign(campaign);
            this.trigger('campaign', placement, campaign);
        }).catch((error) => {
            placement.setCampaign(null);
            this.trigger('error', error);
        });
    }

    private createRequestUrl(placementId: string): string {
        let url: string = [
            CampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'placements',
            placementId,
            'fill'
        ].join('/');

        url = Url.addParameters(url, {
            advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
            androidId: this._deviceInfo.getAndroidId(),
            gameId: this._clientInfo.getGameId(),
            hardwareVersion: this._deviceInfo.getManufacturer() + ' ' + this._deviceInfo.getModel(),
            limitAdTracking: this._deviceInfo.getLimitAdTracking(),
            networkType: this._deviceInfo.getNetworkType(),
            platform: this._clientInfo.getPlatform(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenSize: this._deviceInfo.getScreenLayout(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            softwareVersion: this._deviceInfo.getApiLevel(),
            placementId: placementId
        });

        if(this._clientInfo.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        return url;
    }

}
