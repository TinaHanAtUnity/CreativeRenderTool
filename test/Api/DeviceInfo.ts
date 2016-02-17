import { RingerMode } from '../../src/ts/Constants/Android/RingerMode';
import { BatteryStatus } from '../../src/ts/Constants/Android/BatteryStatus';

export class DeviceInfo {
    
    private _androidId: string = 'de88c6a5d783745b';
    private _advertisingIdentifier: string = '2fad0db3-e775-4d3e-80a5-85281d4ad733';
    private _limitAdTracking: boolean = false;
    private _apiLevel: number = 23;
    private _osVersion: string = '6.0.1';
    private _manufacturer: string = 'LGE';
    private _model: string = 'Nexus 5';
    private _connectionType: string = 'wifi';
    private _networkType: number = 0;
    private _screenLayout: number = 268435794;
    private _screenDensity: number = 480;
    private _screenWidth: number = 1080;
    private _screenHeight: number = 1776;
    private _networkOperator: string = '';
    private _headset: boolean = false;
    private _ringerMode: RingerMode = RingerMode.RINGER_MODE_SILENT;
    private _language: string = 'en_GB';
    private _volume: number = 0;
    private _screenBrightness: number = 82;
    private _freeSpace: number = 10962160;
    private _totalSpace: number = 13162172;
    private _batteryLevel: number = 1;
    private _batteryStatus: BatteryStatus = BatteryStatus.BATTERY_STATUS_FULL;
    private _freeMemory: number = 72756;
    private _totalMemory: number = 1899508;

    public getAndroidId(): any[] {
        return ['OK', this._androidId];
    }

    public getAdvertisingTrackingId(): any[] {
        return ['OK', this._advertisingIdentifier];
    }

    public getLimitAdTrackingFlag(): any[] {
        return ['OK', this._limitAdTracking];
    }

    public getApiLevel(): any[] {
        return ['OK', this._apiLevel];
    }

    public getOsVersion(): any[] {
        return ['OK', this._osVersion];
    }

    public getManufacturer(): any[] {
        return ['OK', this._manufacturer];
    }

    public getModel(): any[] {
        return ['OK', this._model];
    }
    
    public getConnectionType(): any[] {
        return ['OK', this._connectionType];
    }

    public getNetworkType(): any[] {
        return ['OK', this._networkType];
    }

    public getScreenLayout(): any[] {
        return ['OK', this._screenLayout];
    }

    public getScreenDensity(): any[] {
        return ['OK', this._screenDensity];
    }

    public getScreenWidth(): any[] {
        return ['OK', this._screenWidth];
    }

    public getScreenHeight(): any[] {
        return ['OK', this._screenHeight];
    }

    public getNetworkOperatorName(): any[] {
        return ['OK', this._networkOperator];
    }

    public getHeadset(): any[] {
        return ['OK', this._headset];
    }

    public getRingerMode(): any[] {
        return ['OK', this._ringerMode];
    }

    public getSystemLanguage(): any[] {
        return ['OK', this._language];
    }

    public getDeviceVolume(): any[] {
        return ['OK', this._volume];
    }

    public getScreenBrightness(): any[] {
        return ['OK', this._screenBrightness];
    }

    public getFreeSpace(type: string): any[] {
        return ['OK', this._freeSpace];
    }

    public getTotalSpace(type: string): any[] {
        return ['OK', this._totalSpace];
    }

    public getBatteryLevel(): any[] {
        return ['OK', this._batteryLevel];
    }

    public getBatteryStatus(): any[] {
        return ['OK', this._batteryStatus];
    }

    public getFreeMemory(): any[] {
        return ['OK', this._freeMemory];
    }

    public getTotalMemory(): any[] {
        return ['OK', this._totalMemory];
    }

    public getUniqueEventId(): any[] {
        return ['OK', this.generateRandomUUID()];
    }

    private generateRandomUUID(): string {
        let s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

}