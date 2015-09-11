import NativeBridge = require('NativeBridge');
import Observable = require('Utilities/Observable');

import DeviceInfo = require('Device/Info');
import Url = require('Utilities/Url');

import Campaign = require('Models/Campaign');

class CampaignController extends Observable {

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        super();
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
        this._nativeBridge.subscribe("URL", this.onUrlEvent.bind(this));
    }

    private createRequestUrl(zoneId: string) {
        let url = Url.addParameters("http://impact.applifier.com/mobile/campaigns", {
            platform: 'android',
            zoneId: zoneId,
            sdkVersion: 2000,
            gameId: '14851',
            limitAdTracking: 0,
            advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
            androidId: this._deviceInfo.getAndroidId(),
            softwareVersion: this._deviceInfo.getSoftwareVersion(),
            hardwareVersion: this._deviceInfo.getHardwareVersion(),
            screenSize: this._deviceInfo.getScreenLayout(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            wifi: 1,
            networkType: "wifi"
        });
        return url;
    }

    request(zoneId: string) {
        this._nativeBridge.invoke("Url", "get", [this.createRequestUrl(zoneId), []], (status) => {});
    }

    private onComplete(url: string, response: string) {
        let campaignJson = JSON.parse(response);
        let campaign = new Campaign(campaignJson.data.campaigns[0]);
        this.trigger('campaign', 'new', campaign);
    }

    private onFailed() {

    }

    private _eventBindings = {
        "COMPLETE": this.onComplete,
        "FAILED": this.onFailed
    };

    private onUrlEvent(id: string, ...parameters) {
        let handler = this._eventBindings[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

}

export = CampaignController;