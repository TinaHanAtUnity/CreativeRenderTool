import { Observable } from 'Utilities/Observable';

import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';

import { Campaign } from 'Models/Campaign';
import { Zone } from 'Models/Zone';
import { Request } from 'Utilities/Request';

export class CampaignManager extends Observable {

    private _request: Request;
    private _deviceInfo: DeviceInfo;
    private _testMode: boolean;

    constructor(request: Request, deviceInfo: DeviceInfo, testMode: boolean) {
        super();
        this._request = request;
        this._deviceInfo = deviceInfo;
        this._testMode = testMode;
    }

    public request(gameId: string, zone: Zone): void {
        this._request.get(this.createRequestUrl(gameId, zone.getId(), this._testMode)).then(([response]) => {
            let campaignJson: any = JSON.parse(response);
            let campaign: Campaign = new Campaign(campaignJson.data.campaigns[0]);
            zone.setCampaign(campaign);
            this.trigger('campaign', zone, campaign);
        }).catch((error) => {
            zone.setCampaign(null);
            this.trigger('error', error);
        });
    }

    private createRequestUrl(gameId: string, zoneId: string, testMode: boolean): string {
        let url: string = Url.addParameters('http://impact.applifier.com/mobile/campaigns', {
            advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
            androidId: this._deviceInfo.getAndroidId(),
            gameId: gameId,
            hardwareVersion: this._deviceInfo.getHardwareVersion(),
            limitAdTracking: this._deviceInfo.getLimitAdTracking(),
            networkType: this._deviceInfo.getNetworkType(),
            platform: 'android',
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenSize: this._deviceInfo.getScreenLayout(),
            sdkVersion: 2000,
            softwareVersion: this._deviceInfo.getSoftwareVersion(),
            wifi: this._deviceInfo.isWifi() ? 1 : 0,
            zoneId: zoneId
        });

        if(testMode) {
            url = Url.addParameters(url, {test: true});
        }

        return url;
    }

}
