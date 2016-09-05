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

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
    }

    public fetch(): Promise<any[]> {
        let promises: Promise<any>[] = [];

        promises.push(this._nativeBridge.DeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this._advertisingIdentifier = advertisingIdentifier).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this._limitAdTracking = limitAdTracking).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getOsVersion().then(osVersion => this._osVersion = osVersion).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getModel().then(model => this._model = model).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getScreenWidth().then(screenWidth => this._screenWidth = screenWidth).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getScreenHeight().then(screenHeight => this._screenHeight = screenHeight).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getSystemLanguage().then(language => this._language = language).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.isRooted().then(rooted => this._rooted = rooted).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getTimeZone(false).then(timeZone => this._timeZone = timeZone).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getTotalMemory().then(totalMemory => this._totalMemory = totalMemory).catch(err => this.handleDeviceInfoError(err)));

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            promises.push(this._nativeBridge.DeviceInfo.Ios.getUserInterfaceIdiom().then(userInterfaceIdiom => this._userInterfaceIdiom = userInterfaceIdiom).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getScreenScale().then(screenScale => this._screenScale = screenScale).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.isSimulator().then(simulator => this._simulator = simulator).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getTotalSpace().then(totalSpace => this._totalInternalSpace = totalSpace).catch(err => this.handleDeviceInfoError(err)));
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            promises.push(this._nativeBridge.DeviceInfo.Android.getAndroidId().then(androidId => this._androidId = androidId).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getApiLevel().then(apiLevel => this._apiLevel = apiLevel).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this._totalInternalSpace = totalInternalSpace).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this._totalExternalSpace = totalExternalSpace).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getManufacturer().then(manufacturer => this._manufacturer = manufacturer).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getScreenDensity().then(screenDensity => this._screenDensity = screenDensity).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getScreenLayout().then(screenLayout => this._screenLayout = screenLayout).catch(err => this.handleDeviceInfoError(err)));
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

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getNetworkType().then(networkType => {
            this._networkType = networkType;
            return this._networkType;
        });
    }

    public getNetworkOperator(): Promise<string> {
        if (this._nativeBridge.getPlatform() === Platform.IOS || this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.getNetworkOperator().then(networkOperator => {
                this._networkOperator = networkOperator;
                return this._networkOperator;
            });
        } else {
            return Promise.resolve(this._networkOperator);
        }
    }

    public getNetworkOperatorName(): Promise<string> {
        if (this._nativeBridge.getPlatform() === Platform.IOS || this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.getNetworkOperatorName().then(networkOperatorName => {
                this._networkOperatorName = networkOperatorName;
                return this._networkOperatorName;
            });
        } else {
            return Promise.resolve(this._networkOperatorName);
        }
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

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.DeviceInfo.getConnectionType().then(connectionType => {
            this._connectionType = connectionType;
            return this._connectionType;
        });
    }

    public getTimeZone(): string {
        return this._timeZone;
    }

    public getFreeSpace(): Promise<number> {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.DeviceInfo.Ios.getFreeSpace().then(freeInternalSpace => {
                this._freeInternalSpace = freeInternalSpace;
                return this._freeInternalSpace;
            });
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => {
                this._freeInternalSpace = freeInternalSpace;
                return this._freeInternalSpace;
            });
        } else {
            return Promise.resolve(this._freeInternalSpace);
        }
    }

    public getFreeSpaceExternal(): Promise<number> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.EXTERNAL).then(freeSpace => {
                this._freeExternalSpace = freeSpace;
                return this._freeExternalSpace;
            });
        } else {
            return Promise.resolve(this._freeExternalSpace);
        }
    }

    public getTotalSpace(): number {
        return this._totalInternalSpace;
    }

    public getTotalSpaceExternal(): number {
        return this._totalExternalSpace;
    }


    public getLanguage(): string {
        return this._language;
    }

    public isSimulator(): boolean {
        return this._simulator;
    }

    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.DeviceInfo.getHeadset().then(headset => {
            this._headset = headset;
            return this._headset;
        });
    }

    public getRingerMode(): Promise<RingerMode> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getRingerMode().then(ringerMode => {
                this._ringerMode = ringerMode;
                return this._ringerMode;
            });
        } else {
            return Promise.resolve(this._ringerMode);
        }
    }

    public getDeviceVolume(): Promise<number> {
        if (this._nativeBridge.getPlatform()  === Platform.IOS) {
            return this._nativeBridge.DeviceInfo.Ios.getDeviceVolume().then(volume => {
                this._volume = volume;
                return this._volume;
            });
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getDeviceVolume(StreamType.STREAM_SYSTEM).then(volume => {
                this._volume = volume;
                return this._volume;
            });
        } else {
            return Promise.resolve(this._volume);
        }
    }

    public getScreenBrightness(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getScreenBrightness().then(brightness => {
            this._screenBrightness = brightness;
            return this._screenBrightness;
        });
    }

    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getBatteryLevel().then(level => {
            this._batteryLevel = level;
            return this._batteryLevel;
        });
    }

    public getBatteryStatus(): Promise<BatteryStatus> {
        return this._nativeBridge.DeviceInfo.getBatteryStatus().then(batteryStatus => {
            this._batteryStatus = batteryStatus;
            return this._batteryStatus;
        });
    }

    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getFreeMemory().then(freeMemory => {
            this._freeMemory = freeMemory;
            return this._freeMemory;
        });
    }

    public getTotalMemory(): number {
        return this._totalMemory;
    }

    public getDTO(): Promise<any> {
        let promises: Promise<any>[] = [];
        promises.push(this.getConnectionType().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getNetworkType().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getNetworkOperator().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getNetworkOperatorName().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getHeadset().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getDeviceVolume().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getScreenBrightness().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getFreeSpace().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getBatteryLevel().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getBatteryStatus().catch(err => this.handleDeviceInfoError(err)));
        promises.push(this.getFreeMemory().catch(err => this.handleDeviceInfoError(err)));

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            promises.push(this.getFreeSpaceExternal().catch(err => this.handleDeviceInfoError(err)));
            promises.push(this.getRingerMode().catch(err => this.handleDeviceInfoError(err)));
        }

        return Promise.all(promises).then(values => {
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
        });


    }

    private handleDeviceInfoError(error: any) {
        this._nativeBridge.Sdk.logWarning(JSON.stringify(error));
    }
}
