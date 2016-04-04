import { Observable } from 'Utilities/Observable';

import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';

import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';

export class CampaignManager extends Observable {

    private static CampaignBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _failedPlacements: string[];

    constructor(request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        super();
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._failedPlacements = [];
    }

    public request(placement: Placement): void {
        if(this._failedPlacements.indexOf(placement.getId()) > -1) {
            delete this._failedPlacements[this._failedPlacements.indexOf(placement.getId())];
        }

        this._request.get(this.createRequestUrl(placement.getId()), [], 5, 5000).then(([response]) => {
            let campaignJson: any = JSON.parse(response);
            let campaign: Campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
            placement.setCampaign(campaign);
            this.trigger('campaign', placement, campaign);
        }).catch((error) => {
            placement.setCampaign(null);
            this._failedPlacements.push(placement.getId());
            this.trigger('error', error);
        });
    }

    public retryFailedPlacements(placements: { [id: string]: Placement }) {
        for(let placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                if(this._failedPlacements.indexOf(placementId) > -1) {
                    this.request(placements[placementId]);
                }
            }
        }
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
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
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
