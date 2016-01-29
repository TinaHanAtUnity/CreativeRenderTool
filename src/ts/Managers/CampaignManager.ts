import { Observable } from 'Utilities/Observable';

import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';

import { Campaign } from 'Models/Campaign';
import { Zone } from 'Models/Zone';
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

    public request(zone: Zone): void {
        this._request.get(this.createRequestUrl(zone.getId())).then(([response]) => {
            let campaignJson: any = JSON.parse(response);
            let campaign: Campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
            zone.setCampaign(campaign);
            this.trigger('campaign', zone, campaign);
        }).catch((error) => {
            zone.setCampaign(null);
            this.trigger('error', error);
        });
    }

    private createRequestUrl(zoneId: string): string {
        let url: string = [
            CampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'placements',
            zoneId,
            'fill'
        ].join('/');

        url = Url.addParameters(url, {
            advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
            androidId: this._deviceInfo.getAndroidId(),
            gameId: this._clientInfo.getGameId(),
            hardwareVersion: this._deviceInfo.getHardwareVersion(),
            limitAdTracking: this._deviceInfo.getLimitAdTracking(),
            networkType: this._deviceInfo.getNetworkType(),
            platform: this._clientInfo.getPlatform(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenSize: this._deviceInfo.getScreenLayout(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            softwareVersion: this._deviceInfo.getSoftwareVersion(),
            wifi: this._deviceInfo.isWifi() ? 1 : 0,
            zoneId: zoneId
        });

        if(this._clientInfo.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        return url;
    }

}
