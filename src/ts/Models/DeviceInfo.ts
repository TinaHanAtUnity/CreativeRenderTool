import { NativeBridge } from 'Native/NativeBridge';
import { StreamType } from 'Constants/Android/StreamType';
import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Model } from 'Models/Model';
import { Platform } from 'Constants/Platform';
import { StorageType } from 'Native/Api/AndroidDeviceInfo';

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

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            return this.fetchIos(nativeBridge);
        } else {
            return this.fetchAndroid(nativeBridge);
        }
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

    public getNetworkOperator(): string {
        return this._networkOperator;
    }

    public getNetworkOperatorName(): string {
        return this._networkOperatorName;
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

    public getScreenWidth(): number {
        return this._screenWidth;
    }

    public getScreenHeight(): number {
        return this._screenHeight;
    }

    public isRooted(): boolean {
        return this._rooted;
    }

    public getConnectionType(): string {
        return this._connectionType;
    }

    public getTimeZone(): string {
        return this._timeZone;
    }

    public getFreeSpace(): number {
        return this._freeInternalSpace;
    }

    public getLanguage(): string {
        return this._language;
    }

    public getDTO() {
        return {
            'androidId': this._androidId,
            'advertisingId': this._advertisingIdentifier,
            'trackingEnabled': this._limitAdTracking,
            'apiLevel': this._apiLevel,
            'osVersion': this._osVersion,
            'deviceMake': this._manufacturer,
            'deviceModel': this._model,
            'connectionType': this._connectionType,
            'networkType': this._networkType,
            'screenLayout': this._screenLayout,
            'screenDensity': this._screenDensity,
            'screenWidth': this._screenWidth,
            'screenHeight': this._screenHeight,
            'networkOperator': this._networkOperator,
            'networkOperatorName': this._networkOperatorName,
            'timeZone': this._timeZone,
            'headset': this._headset,
            'ringerMode': this._ringerMode,
            'language': this._language,
            'deviceVolume': this._volume,
            'screenBrightness': this._screenBrightness,
            'freeSpaceInternal': this._freeInternalSpace,
            'totalSpaceInternal': this._totalInternalSpace,
            'freeSpaceExternal': this._freeExternalSpace,
            'totalSpaceExternal': this._totalExternalSpace,
            'batteryLevel': this._batteryLevel,
            'batteryStatus': this._batteryStatus,
            'freeMemory': this._freeMemory,
            'totalMemory': this._totalMemory,
            'rooted': this._rooted
        };
    }

    private fetchAndroid(nativeBridge: NativeBridge): Promise<any[]> {
        let promises: Promise<any>[] = [];

        promises.push(nativeBridge.AndroidDeviceInfo.getAndroidId().then(androidId => this._androidId = androidId));
        promises.push(nativeBridge.AndroidDeviceInfo.getScreenLayout().then(screenLayout => this._screenLayout = screenLayout));
        promises.push(nativeBridge.AndroidDeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this._advertisingIdentifier = advertisingIdentifier));
        promises.push(nativeBridge.AndroidDeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this._limitAdTracking = limitAdTracking));
        promises.push(nativeBridge.AndroidDeviceInfo.getApiLevel().then(apiLevel => this._apiLevel = apiLevel));
        promises.push(nativeBridge.AndroidDeviceInfo.getOsVersion().then(osVersion => this._osVersion = osVersion));
        promises.push(nativeBridge.AndroidDeviceInfo.getManufacturer().then(manufacturer => this._manufacturer = manufacturer));
        promises.push(nativeBridge.AndroidDeviceInfo.getModel().then(model => this._model = model));
        promises.push(nativeBridge.AndroidDeviceInfo.getConnectionType().then(connectionType => this._connectionType = connectionType));
        promises.push(nativeBridge.AndroidDeviceInfo.getNetworkType().then(networkType => this._networkType = networkType));
        promises.push(nativeBridge.AndroidDeviceInfo.getScreenDensity().then(screenDensity => this._screenDensity = screenDensity));
        promises.push(nativeBridge.AndroidDeviceInfo.getScreenWidth().then(screenWidth => this._screenWidth = screenWidth));
        promises.push(nativeBridge.AndroidDeviceInfo.getScreenHeight().then(screenHeight => this._screenHeight = screenHeight));
        promises.push(nativeBridge.AndroidDeviceInfo.getNetworkOperator().then(networkOperator => this._networkOperator = networkOperator));
        promises.push(nativeBridge.AndroidDeviceInfo.getNetworkOperatorName().then(networkOperatorName => this._networkOperatorName = networkOperatorName));
        promises.push(nativeBridge.AndroidDeviceInfo.getHeadset().then(headset => this._headset = headset));
        promises.push(nativeBridge.AndroidDeviceInfo.getTimeZone(false).then(timeZone => this._timeZone = timeZone));
        promises.push(nativeBridge.AndroidDeviceInfo.getRingerMode().then(ringerMode => this._ringerMode = ringerMode));
        promises.push(nativeBridge.AndroidDeviceInfo.getSystemLanguage().then(language => this._language = language));
        promises.push(nativeBridge.AndroidDeviceInfo.getDeviceVolume(StreamType.STREAM_SYSTEM).then(volume => this._volume = volume));
        promises.push(nativeBridge.AndroidDeviceInfo.getScreenBrightness().then(screenBrightness => this._screenBrightness = screenBrightness));
        promises.push(nativeBridge.AndroidDeviceInfo.getFreeSpace(StorageType.EXTERNAL).then(freeExternalSpace => this._freeExternalSpace = freeExternalSpace).catch(() => this._freeExternalSpace = undefined));
        promises.push(nativeBridge.AndroidDeviceInfo.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this._totalExternalSpace = totalExternalSpace).catch(() => this._totalExternalSpace = undefined));
        promises.push(nativeBridge.AndroidDeviceInfo.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => this._freeInternalSpace = freeInternalSpace).catch(() => this._freeInternalSpace = undefined));
        promises.push(nativeBridge.AndroidDeviceInfo.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this._totalInternalSpace = totalInternalSpace).catch(() => this._totalInternalSpace = undefined));
        promises.push(nativeBridge.AndroidDeviceInfo.getBatteryLevel().then(batteryLevel => this._batteryLevel = batteryLevel));
        promises.push(nativeBridge.AndroidDeviceInfo.getBatteryStatus().then(batteryStatus => this._batteryStatus = batteryStatus));
        promises.push(nativeBridge.AndroidDeviceInfo.getFreeMemory().then(freeMemory => this._freeMemory = freeMemory));
        promises.push(nativeBridge.AndroidDeviceInfo.getTotalMemory().then(totalMemory => this._totalMemory = totalMemory));
        promises.push(nativeBridge.AndroidDeviceInfo.isRooted().then(rooted => this._rooted = rooted));

        return Promise.all(promises);
    }

    private fetchIos(nativeBridge: NativeBridge): Promise<any[]> {
        let promises: Promise<any>[] = [];

        promises.push(nativeBridge.IosDeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this._advertisingIdentifier = advertisingIdentifier));
        promises.push(nativeBridge.IosDeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this._limitAdTracking = limitAdTracking));
        promises.push(nativeBridge.IosDeviceInfo.getApiLevel().then(apiLevel => this._apiLevel = apiLevel));
        promises.push(nativeBridge.IosDeviceInfo.getOsVersion().then(osVersion => this._osVersion = osVersion));
        promises.push(nativeBridge.IosDeviceInfo.getManufacturer().then(manufacturer => this._manufacturer = manufacturer));
        promises.push(nativeBridge.IosDeviceInfo.getModel().then(model => this._model = model));
        promises.push(nativeBridge.IosDeviceInfo.getConnectionType().then(connectionType => this._connectionType = connectionType));
        promises.push(nativeBridge.IosDeviceInfo.getNetworkType().then(networkType => this._networkType = networkType));
        promises.push(nativeBridge.IosDeviceInfo.getScreenDensity().then(screenDensity => this._screenDensity = screenDensity));
        promises.push(nativeBridge.IosDeviceInfo.getScreenWidth().then(screenWidth => this._screenWidth = screenWidth));
        promises.push(nativeBridge.IosDeviceInfo.getScreenHeight().then(screenHeight => this._screenHeight = screenHeight));
        promises.push(nativeBridge.IosDeviceInfo.getNetworkOperator().then(networkOperator => this._networkOperator = networkOperator));
        promises.push(nativeBridge.IosDeviceInfo.getNetworkOperatorName().then(networkOperatorName => this._networkOperatorName = networkOperatorName));
        promises.push(nativeBridge.IosDeviceInfo.getHeadset().then(headset => this._headset = headset));
        promises.push(nativeBridge.IosDeviceInfo.getTimeZone(false).then(timeZone => this._timeZone = timeZone));
        promises.push(nativeBridge.IosDeviceInfo.getRingerMode().then(ringerMode => this._ringerMode = ringerMode));
        promises.push(nativeBridge.IosDeviceInfo.getSystemLanguage().then(language => this._language = language));
        promises.push(nativeBridge.IosDeviceInfo.getDeviceVolume(StreamType.STREAM_SYSTEM).then(volume => this._volume = volume));
        promises.push(nativeBridge.IosDeviceInfo.getScreenBrightness().then(screenBrightness => this._screenBrightness = screenBrightness));
        promises.push(nativeBridge.IosDeviceInfo.getFreeSpace(StorageType.EXTERNAL).then(freeExternalSpace => this._freeExternalSpace = freeExternalSpace).catch(() => this._freeExternalSpace = undefined));
        promises.push(nativeBridge.IosDeviceInfo.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this._totalExternalSpace = totalExternalSpace).catch(() => this._totalExternalSpace = undefined));
        promises.push(nativeBridge.IosDeviceInfo.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => this._freeInternalSpace = freeInternalSpace).catch(() => this._freeInternalSpace = undefined));
        promises.push(nativeBridge.IosDeviceInfo.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this._totalInternalSpace = totalInternalSpace).catch(() => this._totalInternalSpace = undefined));
        promises.push(nativeBridge.IosDeviceInfo.getBatteryLevel().then(batteryLevel => this._batteryLevel = batteryLevel));
        promises.push(nativeBridge.IosDeviceInfo.getBatteryStatus().then(batteryStatus => this._batteryStatus = batteryStatus));
        promises.push(nativeBridge.IosDeviceInfo.getFreeMemory().then(freeMemory => this._freeMemory = freeMemory));
        promises.push(nativeBridge.IosDeviceInfo.getTotalMemory().then(totalMemory => this._totalMemory = totalMemory));
        promises.push(nativeBridge.IosDeviceInfo.isRooted().then(rooted => this._rooted = rooted));

        return Promise.all(promises);
    }
}
