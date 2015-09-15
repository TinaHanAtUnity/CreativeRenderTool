import Observable from 'Utilities/Observable';

import DeviceInfo from 'Device/Info';
import Url from 'Utilities/Url';

import Campaign from 'Models/Campaign';
import Zone from 'Models/Zone';
import Request from 'Utilities/Request';

export default class CampaignManager extends Observable {

    private _request: Request;
    private _deviceInfo: DeviceInfo;

    constructor(request: Request, deviceInfo: DeviceInfo) {
        super();
        this._request = request;
        this._deviceInfo = deviceInfo;
    }

    public request(zone: Zone): void {
        let onComplete: (url: string, response: string) => void = (url: string, response: string) => {
            let campaignJson: any = JSON.parse(response);
            let campaign: Campaign = new Campaign(campaignJson.data.campaigns[0]);
            zone.setCampaign(campaign);
            this.trigger('campaign', 'new', zone);
        };
        let onError: (url: string, error: string) => void = (url: string, error: string) => {
            zone.setCampaign(null);
            this.trigger('campaign', 'error', zone);
        };
        this._request.get(this.createRequestUrl(zone.getId()), onComplete, onError);
    }

    private createRequestUrl(zoneId: string): string {
        let url: string = Url.addParameters('http://impact.applifier.com/mobile/campaigns', {
            advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
            androidId: this._deviceInfo.getAndroidId(),
            gameId: '14851',
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
        return url;
    }

}
