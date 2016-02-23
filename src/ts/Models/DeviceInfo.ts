import { NativeBridge, BatchInvocation } from 'NativeBridge';
import { StreamType } from 'Constants/Android/StreamType';
import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Model } from 'Models/Model';

enum StorageType {
    EXTERNAL,
    INTERNAL
}

export class DeviceInfo extends Model {

    private _androidId: string = null;
    private _advertisingIdentifier: string = null;
    private _limitAdTracking: boolean = false;
    private _apiLevel: number;
    private _osVersion: string;
    private _manufacturer: string;
    private _model: string;
    private _connectionType: string;
    private _networkType: string;
    private _screenLayout: number;
    private _screenDensity: number;
    private _screenWidth: number;
    private _screenHeight: number;
    private _networkOperator: string;
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

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        let className: string = 'DeviceInfo';
        let batch: BatchInvocation = new BatchInvocation(nativeBridge);
        batch.queue(className, 'getAndroidId').then(([androidId]) => this._androidId = androidId);
        batch.queue(className, 'getAdvertisingTrackingId').then(([advertisingIdentifier]) => this._advertisingIdentifier = advertisingIdentifier);
        batch.queue(className, 'getLimitAdTrackingFlag').then(([limitAdTracking]) => this._limitAdTracking = limitAdTracking);
        batch.queue(className, 'getApiLevel').then(([apiLevel]) => this._apiLevel = apiLevel);
        batch.queue(className, 'getOsVersion').then(([osVersion]) => this._osVersion = osVersion);
        batch.queue(className, 'getManufacturer').then(([manufacturer]) => this._manufacturer = manufacturer);
        batch.queue(className, 'getModel').then(([model]) => this._model = model);
        batch.queue(className, 'getConnectionType').then(([connectionType]) => this._connectionType = connectionType);
        batch.queue(className, 'getNetworkType').then(([networkType]) => this._networkType = networkType);
        batch.queue(className, 'getScreenLayout').then(([screenLayout]) => this._screenLayout = screenLayout);
        batch.queue(className, 'getScreenDensity').then(([screenDensity]) => this._screenDensity = screenDensity);
        batch.queue(className, 'getScreenWidth').then(([screenWidth]) => this._screenWidth = screenWidth);
        batch.queue(className, 'getScreenHeight').then(([screenHeight]) => this._screenHeight = screenHeight);
        batch.queue(className, 'getNetworkOperatorName').then(([networkOperator]) => this._networkOperator = networkOperator);
        batch.queue(className, 'getHeadset').then(([headset]) => this._headset = headset);
        batch.queue(className, 'getRingerMode').then(([ringerMode]) => this._ringerMode = ringerMode);
        batch.queue(className, 'getSystemLanguage').then(([language]) => this._language = language);
        batch.queue(className, 'getDeviceVolume', [StreamType.STREAM_SYSTEM]).then(([volume]) => this._volume = volume);
        batch.queue(className, 'getScreenBrightness').then(([screenBrightness]) => this._screenBrightness = screenBrightness);
        batch.queue(className, 'getFreeSpace', [StorageType[StorageType.EXTERNAL]]).then(([freeExternalSpace]) => this._freeExternalSpace = freeExternalSpace);
        batch.queue(className, 'getTotalSpace', [StorageType[StorageType.EXTERNAL]]).then(([totalExternalSpace]) => this._totalExternalSpace = totalExternalSpace);
        batch.queue(className, 'getFreeSpace', [StorageType[StorageType.INTERNAL]]).then(([freeInternalSpace]) => this._freeInternalSpace = freeInternalSpace);
        batch.queue(className, 'getTotalSpace', [StorageType[StorageType.INTERNAL]]).then(([totalInternalSpace]) => this._totalInternalSpace = totalInternalSpace);
        batch.queue(className, 'getBatteryLevel').then(([batteryLevel]) => this._batteryLevel = batteryLevel);
        batch.queue(className, 'getBatteryStatus').then(([batteryStatus]) => this._batteryStatus = batteryStatus);
        batch.queue(className, 'getFreeMemory').then(([freeMemory]) => this._freeMemory = freeMemory);
        batch.queue(className, 'getTotalMemory').then(([totalMemory]) => this._totalMemory = totalMemory);
        return nativeBridge.invokeBatch(batch);
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

    public getNetworkType(): string {
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
            'total_memory': this._totalMemory
        };
    }

}
