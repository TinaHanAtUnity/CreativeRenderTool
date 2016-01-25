import { Zone } from 'Models/Zone';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';

export class ConfigManager {

    private static ConfigUrl = 'http://impact.applifier.com/mobile/campaigns';

    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    private _zones: Object = {};
    private _defaultZone: Zone = null;

    constructor(request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    public fetch(): Promise<void> {
        return this._request.get(this.createConfigUrl()).then(([response]) => {
            let configJson = JSON.parse(response);

            let zones = [
                {
                    'id': 'defaultVideoAndPictureZone',
                    'name': 'Video ad placement',
                    'enabled': true,
                    'default': true,
                    'incentivised': false,
                    'allowSkipVideoInSeconds': 5,
                    'disableBackButtonForSeconds': 30,
                    'muteVideoSounds': false,
                    'useDeviceOrientationForVideo': true
                },
                {
                    'id': 'incentivizedZone',
                    'name': 'Incentivized placement',
                    'enabled': true,
                    'default': false,
                    'incentivized': true,
                    'allowSkipVideoInSeconds': -1,
                    'disableBackButtonForSeconds': 30,
                    'muteVideoSounds': true,
                    'useDeviceOrientationForVideo': false
                }
            ];

            zones.forEach((rawZone: any): void => {
                let zone: Zone = new Zone(rawZone);
                this._zones[zone.getId()] = zone;
                if(zone.isDefault()) {
                    this._defaultZone = zone;
                }
            });
        });
    }

    public getZone(zoneId: string): Zone {
        return this._zones[zoneId];
    }

    public getZones(): Object {
        return this._zones;
    }

    public getDefaultZone(): Zone {
        return this._defaultZone;
    }

    private createConfigUrl(): string {
        let url: string = Url.addParameters(ConfigManager.ConfigUrl, {
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
            wifi: this._deviceInfo.isWifi() ? 1 : 0
        });

        if(this._clientInfo.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        return url;
    }

}
