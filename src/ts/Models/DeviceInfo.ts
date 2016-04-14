import { NativeBridge } from 'Native/NativeBridge';
import { StreamType } from 'Constants/Android/StreamType';
import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Model } from 'Models/Model';
import { Platform } from 'Constants/Platform';
import { StorageType } from 'Native/Api/DeviceInfo';

export class DeviceInfo extends Model {

    private _androidId: string;
    private _advertisingIdentifier: string;
    private _limitAdTracking: boolean;
    private _apiLevel: number;
    private _osVersion: string;
    private _manufacturer: string;
    private _model: string;
    private _connectionType: string;
    private _networkType: number;
    private _screenLayout: number;
    private _screenDensity: number;
    private _screenWidth: number;
    private _screenHeight: number;
    private _networkOperator: string;
    private _networkOperatorName: string;
    private _timeZone: string;
    private _headset: boolean;
    private _ringerMode: RingerMode;
    private _language: string;
    private _volume: number;
    private _screenBrightness: number;
    private _freeExternalSpace: number;
    private _totalExternalSpace: number;
    private _freeInternalSpace: number;
    private _totalInternalSpace: number;
    private _batteryLevel: number;
    private _batteryStatus: BatteryStatus;
    private _freeMemory: number;
    private _totalMemory: number;
    private _rooted: boolean;

    public fetch(nativeBridge: NativeBridge, platform: Platform): Promise<any[]> {
        let promises = [];

        if(platform === Platform.ANDROID) {
            nativeBridge.DeviceInfo.getAndroidId().then(androidId => this._androidId = androidId);
            nativeBridge.DeviceInfo.getScreenLayout().then(screenLayout => this._screenLayout = screenLayout);
        }

        nativeBridge.DeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this._advertisingIdentifier = advertisingIdentifier);
        nativeBridge.DeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this._limitAdTracking = limitAdTracking);
        nativeBridge.DeviceInfo.getApiLevel().then(apiLevel => this._apiLevel = apiLevel);
        nativeBridge.DeviceInfo.getOsVersion().then(osVersion => this._osVersion = osVersion);
        nativeBridge.DeviceInfo.getManufacturer().then(manufacturer => this._manufacturer = manufacturer);
        nativeBridge.DeviceInfo.getModel().then(model => this._model = model);
        nativeBridge.DeviceInfo.getConnectionType().then(connectionType => this._connectionType = connectionType);
        nativeBridge.DeviceInfo.getNetworkType().then(networkType => this._networkType = networkType);
        nativeBridge.DeviceInfo.getScreenDensity().then(screenDensity => this._screenDensity = screenDensity);
        nativeBridge.DeviceInfo.getScreenWidth().then(screenWidth => this._screenWidth = screenWidth);
        nativeBridge.DeviceInfo.getScreenHeight().then(screenHeight => this._screenHeight = screenHeight);
        nativeBridge.DeviceInfo.getNetworkOperator().then(networkOperator => this._networkOperator = networkOperator);
        nativeBridge.DeviceInfo.getNetworkOperatorName().then(networkOperatorName => this._networkOperatorName = networkOperatorName);
        nativeBridge.DeviceInfo.getHeadset().then(headset => this._headset = headset);
        nativeBridge.DeviceInfo.getTimeZone(false).then(timeZone => this._timeZone = timeZone);
        nativeBridge.DeviceInfo.getRingerMode().then(ringerMode => this._ringerMode = ringerMode);
        nativeBridge.DeviceInfo.getSystemLanguage().then(language => this._language = language);
        nativeBridge.DeviceInfo.getDeviceVolume(StreamType.STREAM_SYSTEM).then(volume => this._volume = volume);
        nativeBridge.DeviceInfo.getScreenBrightness().then(screenBrightness => this._screenBrightness = screenBrightness);
        nativeBridge.DeviceInfo.getFreeSpace(StorageType.EXTERNAL).then(freeExternalSpace => this._freeExternalSpace = freeExternalSpace).catch(() => this._freeExternalSpace = undefined);
        nativeBridge.DeviceInfo.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this._totalExternalSpace = totalExternalSpace).catch(() => this._totalExternalSpace = undefined);
        nativeBridge.DeviceInfo.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => this._freeInternalSpace = freeInternalSpace).catch(() => this._freeInternalSpace = undefined);
        nativeBridge.DeviceInfo.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this._totalInternalSpace = totalInternalSpace).catch(() => this._totalInternalSpace = undefined);
        nativeBridge.DeviceInfo.getBatteryLevel().then(batteryLevel => this._batteryLevel = batteryLevel);
        nativeBridge.DeviceInfo.getBatteryStatus().then(batteryStatus => this._batteryStatus = batteryStatus);
        nativeBridge.DeviceInfo.getFreeMemory().then(freeMemory => this._freeMemory = freeMemory);
        nativeBridge.DeviceInfo.getTotalMemory().then(totalMemory => this._totalMemory = totalMemory);
        nativeBridge.DeviceInfo.isRooted().then(rooted => this._rooted = rooted);

        return Promise.all(promises);
    }

    public getAndroidId(): string {
        return this._androidId;
    }

    public getAdvertisingIdentifier(): string {
        return this._advertisingIdentifier;
    }

    public getLimitAdTracking(): boolean {
        return this._limitAdTracking;
    }

    public getApiLevel(): number {
        return this._apiLevel;
    }

    public getManufacturer(): string {
        return this._manufacturer;
    }

    public getModel(): string {
        return this._model;
    }

    public getNetworkType(): number {
        return this._networkType;
    }

    public getOsVersion(): string {
        return this._osVersion;
    }

    public getScreenLayout(): number {
        return this._screenLayout;
    }

    public getScreenDensity(): number {
        return this._screenDensity;
    }

    public getDTO() {
        return {
            'android_id': this._androidId,
            'advertising_id': this._advertisingIdentifier,
            'tracking_enabled': this._limitAdTracking,
            'api_level': this._apiLevel,
            'os_version': this._osVersion,
            'manufacturer': this._manufacturer,
            'model': this._model,
            'connection_type': this._connectionType,
            'network_type': this._networkType,
            'screen_layout': this._screenLayout,
            'screen_density': this._screenDensity,
            'screen_width': this._screenWidth,
            'screen_height': this._screenHeight,
            'network_operator': this._networkOperator,
            'network_operator_name': this._networkOperatorName,
            'timezone': this._timeZone,
            'headset': this._headset,
            'ringer_mode': this._ringerMode,
            'language': this._language,
            'device_volume': this._volume,
            'screen_brightness': this._screenBrightness,
            'free_space_internal': this._freeInternalSpace,
            'total_space_internal': this._totalInternalSpace,
            'free_space_external': this._freeExternalSpace,
            'total_space_external': this._totalExternalSpace,
            'battery_level': this._batteryLevel,
            'battery_status': this._batteryStatus,
            'free_memory': this._freeMemory,
            'total_memory': this._totalMemory,
            'rooted': this._rooted
        };
    }

}
