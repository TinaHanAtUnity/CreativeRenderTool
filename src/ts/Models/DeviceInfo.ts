import { NativeBridge } from 'Native/NativeBridge';
import { StreamType } from 'Constants/Android/StreamType';
import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Model } from 'Models/Model';
import { Platform } from 'Constants/Platform';
import { StorageType } from 'Native/Api/AndroidDeviceInfo';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';

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
    private _screenScale: number;
    private _userInterfaceIdiom: UIUserInterfaceIdiom;
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
    private _simulator: boolean;
    private _appleWatchPaired: boolean;

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        let promises: Promise<any>[] = [];

        promises.push(nativeBridge.DeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this._advertisingIdentifier = advertisingIdentifier));
        promises.push(nativeBridge.DeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this._limitAdTracking = limitAdTracking));
        promises.push(nativeBridge.DeviceInfo.getOsVersion().then(osVersion => this._osVersion = osVersion));
        promises.push(nativeBridge.DeviceInfo.getModel().then(model => this._model = model));
        promises.push(nativeBridge.DeviceInfo.getConnectionType().then(connectionType => this._connectionType = connectionType));
        promises.push(nativeBridge.DeviceInfo.getNetworkType().then(networkType => this._networkType = networkType));
        promises.push(nativeBridge.DeviceInfo.getScreenWidth().then(screenWidth => this._screenWidth = screenWidth));
        promises.push(nativeBridge.DeviceInfo.getScreenHeight().then(screenHeight => this._screenHeight = screenHeight));
        promises.push(nativeBridge.DeviceInfo.getNetworkOperator().then(networkOperator => this._networkOperator = networkOperator));
        promises.push(nativeBridge.DeviceInfo.getNetworkOperatorName().then(networkOperatorName => this._networkOperatorName = networkOperatorName));
        promises.push(nativeBridge.DeviceInfo.getHeadset().then(headset => this._headset = headset));
        promises.push(nativeBridge.DeviceInfo.getTimeZone(false).then(timeZone => this._timeZone = timeZone));
        promises.push(nativeBridge.DeviceInfo.getSystemLanguage().then(language => this._language = language));
        promises.push(nativeBridge.DeviceInfo.getScreenBrightness().then(screenBrightness => this._screenBrightness = screenBrightness));
        promises.push(nativeBridge.DeviceInfo.getBatteryLevel().then(batteryLevel => this._batteryLevel = batteryLevel));
        promises.push(nativeBridge.DeviceInfo.getBatteryStatus().then(batteryStatus => this._batteryStatus = batteryStatus));
        promises.push(nativeBridge.DeviceInfo.getFreeMemory().then(freeMemory => this._freeMemory = freeMemory));
        promises.push(nativeBridge.DeviceInfo.getTotalMemory().then(totalMemory => this._totalMemory = totalMemory));
        promises.push(nativeBridge.DeviceInfo.isRooted().then(rooted => this._rooted = rooted));

        if(nativeBridge.getPlatform() === Platform.IOS) {
            promises.push(nativeBridge.DeviceInfo.Ios.getDeviceVolume().then(volume => this._volume = volume));
            promises.push(nativeBridge.DeviceInfo.Ios.getFreeSpace().then(freeInternalSpace => this._freeInternalSpace = freeInternalSpace).catch(() => this._freeInternalSpace = undefined));
            promises.push(nativeBridge.DeviceInfo.Ios.getTotalSpace().then(totalInternalSpace => this._totalInternalSpace = totalInternalSpace).catch(() => this._totalInternalSpace = undefined));
            promises.push(nativeBridge.DeviceInfo.Ios.getUserInterfaceIdiom().then(userInterfaceIdiom => this._userInterfaceIdiom = userInterfaceIdiom));
        } else {
            promises.push(nativeBridge.DeviceInfo.Android.getScreenLayout().then(screenLayout => this._screenLayout = screenLayout));
            promises.push(nativeBridge.DeviceInfo.Android.getAndroidId().then(androidId => this._androidId = androidId));
            promises.push(nativeBridge.DeviceInfo.Android.getApiLevel().then(apiLevel => this._apiLevel = apiLevel));
            promises.push(nativeBridge.DeviceInfo.Android.getManufacturer().then(manufacturer => this._manufacturer = manufacturer));
            promises.push(nativeBridge.DeviceInfo.Android.getScreenDensity().then(screenDensity => this._screenDensity = screenDensity));
            promises.push(nativeBridge.DeviceInfo.Android.getRingerMode().then(ringerMode => this._ringerMode = ringerMode));
            promises.push(nativeBridge.DeviceInfo.Android.getDeviceVolume(StreamType.STREAM_SYSTEM).then(volume => this._volume = volume));
            promises.push(nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.EXTERNAL).then(freeExternalSpace => this._freeExternalSpace = freeExternalSpace).catch(() => this._freeExternalSpace = undefined));
            promises.push(nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this._totalExternalSpace = totalExternalSpace).catch(() => this._totalExternalSpace = undefined));
            promises.push(nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => this._freeInternalSpace = freeInternalSpace).catch(() => this._freeInternalSpace = undefined));
            promises.push(nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this._totalInternalSpace = totalInternalSpace).catch(() => this._totalInternalSpace = undefined));
        }

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

    public getScreenScale(): number {
        return this._screenScale;
    }

    public getUserInterfaceIdiom(): UIUserInterfaceIdiom {
        return this._userInterfaceIdiom;
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

    public isSimulator(): boolean {
        return this._simulator;
    }

    public isAppleWatchPaired(): boolean {
        return this._appleWatchPaired;
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
            'screenScale': this._screenScale,
            'userInterfaceIdiom': this._userInterfaceIdiom,
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
            'rooted': this._rooted,
            'simulator': this._simulator,
            'appleWatchPaired': this._appleWatchPaired
        };
    }
}
