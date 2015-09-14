import NativeBridge from 'NativeBridge';
import Observable from 'Utilities/Observable';

import DeviceInfo from 'Device/Info';
import Url from 'Utilities/Url';

import Campaign from 'Models/Campaign';

export default class CampaignManager extends Observable {

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;

    private _eventBindings: Object = {
        'COMPLETE': this.onComplete
    };

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        super();
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
        this._nativeBridge.subscribe('URL', this.onUrlEvent.bind(this));
    }

    public request(zoneId: string): void {
        this._nativeBridge.invoke('Url', 'get', [this.createRequestUrl(zoneId), []]);
    }

    private createRequestUrl(zoneId: string): string {
        let url: string = Url.addParameters('http://impact.applifier.com/mobile/campaigns', {
            advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
            androidId: this._deviceInfo.getAndroidId(),
            gameId: '14851',
            hardwareVersion: this._deviceInfo.getHardwareVersion(),
            limitAdTracking: 0,
            networkType: 'wifi',
            platform: 'android',
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenSize: this._deviceInfo.getScreenLayout(),
            sdkVersion: 2000,
            softwareVersion: this._deviceInfo.getSoftwareVersion(),
            wifi: 1,
            zoneId: zoneId
        });
        return url;
    }

    private onComplete(url: string, response: string): void {
        let campaignJson: any = JSON.parse(response);
        let campaign: Campaign = new Campaign(campaignJson.data.campaigns[0]);
        this.trigger('campaign', 'new', campaign);
    }

    private onUrlEvent(id: string, ...parameters: any[]): void {
        let handler: Function = this._eventBindings[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

}
