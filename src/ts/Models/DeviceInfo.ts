import { NativeBridge } from 'Native/NativeBridge';
import { StreamType } from 'Constants/Android/StreamType';
import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Model } from 'Models/Model';
import { Platform } from 'Constants/Platform';
import { StorageType } from 'Native/Api/AndroidDeviceInfo';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';

interface IDeviceInfo {
    androidId: string;
    advertisingIdentifier: string | undefined | null;
    limitAdTracking: boolean | undefined;
    apiLevel: number;
    osVersion: string;
    manufacturer: string;
    model: string;
    connectionType: string;
    networkType: number;
    screenLayout: number;
    screenDensity: number;
    screenWidth: number;
    screenHeight: number;
    screenScale: number;
    userInterfaceIdiom: UIUserInterfaceIdiom;
    networkOperator: string | null;
    networkOperatorName: string | null;
    timeZone: string;
    headset: boolean;
    ringerMode: RingerMode;
    language: string;
    volume: number;
    screenBrightness: number;
    freeExternalSpace: number;
    totalExternalSpace: number;
    freeInternalSpace: number;
    totalInternalSpace: number;
    batteryLevel: number;
    batteryStatus: BatteryStatus;
    freeMemory: number;
    totalMemory: number;
    rooted: boolean;
    simulator: boolean;
    isGoogleStoreInstalled: boolean;
    isXiaomiStoreInstalled: boolean;
    statusBarHeight: number;
}

export class DeviceInfo extends Model<IDeviceInfo> {

    public static GooglePlayPackageName = 'com.android.vending';
    public static XiaomiPackageName = 'com.xiaomi.gamecenter';

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        super('DeviceInfo', {
            androidId: ['string'],
            advertisingIdentifier: ['string', 'undefined', 'null'],
            limitAdTracking: ['boolean', 'undefined'],
            apiLevel: ['number'],
            osVersion: ['string'],
            manufacturer: ['string'],
            model: ['string'],
            connectionType: ['string'],
            networkType: ['number'],
            screenLayout: ['number'],
            screenDensity: ['number'],
            screenWidth: ['integer'],
            screenHeight: ['integer'],
            screenScale: ['number'],
            userInterfaceIdiom: ['number'],
            networkOperator: ['string', 'null'],
            networkOperatorName: ['string', 'null'],
            timeZone: ['string'],
            headset: ['boolean'],
            ringerMode: ['number'],
            language: ['string'],
            volume: ['number'],
            screenBrightness: ['number'],
            freeExternalSpace: ['number'],
            totalExternalSpace: ['number'],
            freeInternalSpace: ['number'],
            totalInternalSpace: ['number'],
            batteryLevel: ['number'],
            batteryStatus: ['number'],
            freeMemory: ['number'],
            totalMemory: ['number'],
            rooted: ['boolean'],
            simulator: ['boolean'],
            isGoogleStoreInstalled: ['boolean'],
            isXiaomiStoreInstalled: ['boolean'],
            statusBarHeight: ['number']
        });

        this._nativeBridge = nativeBridge;
    }

    public fetch(): Promise<any[]> {
        const promises: Array<Promise<any>> = [];

        promises.push(this._nativeBridge.DeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this.set('advertisingIdentifier', advertisingIdentifier)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this.set('limitAdTracking', limitAdTracking)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getOsVersion().then(osVersion => this.set('osVersion', osVersion)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getModel().then(model => this.set('model', model)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getScreenWidth().then(screenWidth => this.set('screenWidth', Math.floor(screenWidth))).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getScreenHeight().then(screenHeight => this.set('screenHeight', Math.floor(screenHeight))).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getSystemLanguage().then(language => this.set('language', language)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.isRooted().then(rooted => this.set('rooted', rooted)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getTimeZone(false).then(timeZone => this.set('timeZone', timeZone)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._nativeBridge.DeviceInfo.getTotalMemory().then(totalMemory => this.set('totalMemory', totalMemory)).catch(err => this.handleDeviceInfoError(err)));

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            promises.push(this._nativeBridge.DeviceInfo.Ios.getUserInterfaceIdiom().then(userInterfaceIdiom => this.set('userInterfaceIdiom', userInterfaceIdiom)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getScreenScale().then(screenScale => this.set('screenScale', screenScale)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.isSimulator().then(simulator => this.set('simulator', simulator)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getTotalSpace().then(totalSpace => this.set('totalInternalSpace', totalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getStatusBarHeight().then(statusBarHeight => this.set('statusBarHeight', statusBarHeight)).catch(err => this.handleDeviceInfoError(err)));
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            promises.push(this._nativeBridge.DeviceInfo.Android.getAndroidId().then(androidId => this.set('androidId', androidId)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getApiLevel().then(apiLevel => this.set('apiLevel', apiLevel)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this.set('totalInternalSpace', totalInternalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this.set('totalExternalSpace', totalExternalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getManufacturer().then(manufacturer => this.set('manufacturer', manufacturer)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getScreenDensity().then(screenDensity => this.set('screenDensity', screenDensity)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getScreenLayout().then(screenLayout => this.set('screenLayout', screenLayout)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.isAppInstalled(DeviceInfo.GooglePlayPackageName).then(isGoogleInstalled => this.set('isGoogleStoreInstalled', isGoogleInstalled)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.isAppInstalled(DeviceInfo.XiaomiPackageName).then(isXiaomiInstalled => this.set('isXiaomiStoreInstalled', isXiaomiInstalled)).catch(err => this.handleDeviceInfoError(err)));
        }

        return Promise.all(promises);
    }

    public getStores(): string {
        let storeString = "";
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            storeString = "apple";
        } else {
            if (this.isGoogleStoreInstalled()) {
                storeString = "google";
            }
            if (this.isXiaomiStoreInstalled()) {
                storeString = "xiaomi";
            }
            if (this.isXiaomiStoreInstalled() && this.isGoogleStoreInstalled()) {
                storeString = "xiaomi,google";
            }
            if (!this.isXiaomiStoreInstalled() && !this.isGoogleStoreInstalled()) {
                storeString = "none";
            }
        }
        return storeString;
    }

    public isGoogleStoreInstalled(): boolean {
        return this.get('isGoogleStoreInstalled');
    }

    public isXiaomiStoreInstalled(): boolean {
        return this.get('isXiaomiStoreInstalled');
    }

    public getAndroidId(): string {
        return this.get('androidId');
    }

    public getAdvertisingIdentifier(): string | undefined | null {
        return this.get('advertisingIdentifier');
    }

    public getLimitAdTracking(): boolean | undefined {
        return this.get('limitAdTracking');
    }

    public getApiLevel(): number {
        return this.get('apiLevel');
    }

    public getManufacturer(): string {
        return this.get('manufacturer');
    }

    public getModel(): string {
        return this.get('model');
    }

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getNetworkType().then(networkType => {
            this.set('networkType', networkType);
            return this.get('networkType');
        });
    }

    public getNetworkOperator(): Promise<string | null> {
        if (this._nativeBridge.getPlatform() === Platform.IOS || this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.getNetworkOperator().then(networkOperator => {
                this.set('networkOperator', networkOperator);
                return this.get('networkOperator');
            });
        } else {
            return Promise.resolve(this.get('networkOperator'));
        }
    }

    public getNetworkOperatorName(): Promise<string | null> {
        if (this._nativeBridge.getPlatform() === Platform.IOS || this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.getNetworkOperatorName().then(networkOperatorName => {
                this.set('networkOperatorName', networkOperatorName);
                return this.get('networkOperatorName');
            });
        } else {
            return Promise.resolve(this.get('networkOperatorName'));
        }
    }

    public getOsVersion(): string {
        return this.get('osVersion');
    }

    public getScreenLayout(): number {
        return this.get('screenLayout');
    }

    public getScreenDensity(): number {
        return this.get('screenDensity');
    }

    public getScreenWidth(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getScreenWidth().then(screenWidth => {
            const adjustedScreenWidth = Math.floor(screenWidth);
            this.set('screenWidth', adjustedScreenWidth);
            return adjustedScreenWidth;
        });
    }

    public getScreenHeight(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getScreenHeight().then(screenHeight => {
            const adjustedScreenHeight = Math.floor(screenHeight);
            this.set('screenHeight', adjustedScreenHeight);
            return adjustedScreenHeight;
        });
    }

    public getScreenScale(): number {
        return this.get('screenScale');
    }

    public getUserInterfaceIdiom(): UIUserInterfaceIdiom {
        return this.get('userInterfaceIdiom');
    }

    public isRooted(): boolean {
        return this.get('rooted');
    }

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.DeviceInfo.getConnectionType().then(connectionType => {
            this.set('connectionType', connectionType);
            return this.get('connectionType');
        });
    }

    public getTimeZone(): string {
        return this.get('timeZone');
    }

    public getFreeSpace(): Promise<number> {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.DeviceInfo.Ios.getFreeSpace().then(freeInternalSpace => {
                this.set('freeInternalSpace', freeInternalSpace);
                return this.get('freeInternalSpace');
            });
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => {
                this.set('freeInternalSpace', freeInternalSpace);
                return this.get('freeInternalSpace');
            });
        } else {
            return Promise.resolve(this.get('freeInternalSpace'));
        }
    }

    public getFreeSpaceExternal(): Promise<number> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.EXTERNAL).then(freeSpace => {
                this.set('freeExternalSpace', freeSpace);
                return this.get('freeExternalSpace');
            });
        } else {
            return Promise.resolve(this.get('freeExternalSpace'));
        }
    }

    public getTotalSpace(): number {
        return this.get('totalInternalSpace');
    }

    public getTotalSpaceExternal(): number {
        return this.get('totalExternalSpace');
    }

    public getLanguage(): string {
        return this.get('language');
    }

    public isSimulator(): boolean {
        return this.get('simulator');
    }

    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.DeviceInfo.getHeadset().then(headset => {
            this.set('headset', headset);
            return this.get('headset');
        });
    }

    public getRingerMode(): Promise<RingerMode> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getRingerMode().then(ringerMode => {
                this.set('ringerMode', ringerMode);
                return this.get('ringerMode');
            });
        } else {
            return Promise.resolve(this.get('ringerMode'));
        }
    }

    public getDeviceVolume(streamType: StreamType = StreamType.STREAM_SYSTEM): Promise<number> {
        if (this._nativeBridge.getPlatform()  === Platform.IOS) {
            return this._nativeBridge.DeviceInfo.Ios.getDeviceVolume().then(volume => {
                this.set('volume', volume);
                return this.get('volume');
            });
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.DeviceInfo.Android.getDeviceVolume(streamType).then(volume => {
                this.set('volume', volume);
                return this.get('volume');
            });
        } else {
            return Promise.resolve(this.get('volume'));
        }
    }

    public getScreenBrightness(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getScreenBrightness().then(brightness => {
            this.set('screenBrightness', brightness);
            return this.get('screenBrightness');
        });
    }

    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getBatteryLevel().then(level => {
            this.set('batteryLevel', level);
            return this.get('batteryLevel');
        });
    }

    public getBatteryStatus(): Promise<BatteryStatus> {
        return this._nativeBridge.DeviceInfo.getBatteryStatus().then(batteryStatus => {
            this.set('batteryStatus', batteryStatus);
            return this.get('batteryStatus');
        });
    }

    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getFreeMemory().then(freeMemory => {
            this.set('freeMemory', freeMemory);
            return this.get('freeMemory');
        });
    }

    public getTotalMemory(): number {
        return this.get('totalMemory');
    }

    public getStatusBarHeight(): number {
        return this.get('statusBarHeight');
    }

    public getDTO(): Promise<any> {
        return Promise.all<any>([
            this.getConnectionType().catch(err => this.handleDeviceInfoError(err)),
            this.getNetworkType().catch(err => this.handleDeviceInfoError(err)),
            this.getNetworkOperator().catch(err => this.handleDeviceInfoError(err)),
            this.getNetworkOperatorName().catch(err => this.handleDeviceInfoError(err)),
            this.getHeadset().catch(err => this.handleDeviceInfoError(err)),
            this.getDeviceVolume().catch(err => this.handleDeviceInfoError(err)),
            this.getScreenWidth().catch(err => this.handleDeviceInfoError(err)),
            this.getScreenHeight().catch(err => this.handleDeviceInfoError(err)),
            this.getScreenBrightness().catch(err => this.handleDeviceInfoError(err)),
            this.getFreeSpace().catch(err => this.handleDeviceInfoError(err)),
            this.getBatteryLevel().catch(err => this.handleDeviceInfoError(err)),
            this.getBatteryStatus().catch(err => this.handleDeviceInfoError(err)),
            this.getFreeMemory().catch(err => this.handleDeviceInfoError(err))
        ]).then(([
            connectionType,
            networkType,
            networkOperator,
            networkOperatorName,
            headset,
            deviceVolume,
            screenWidth,
            screenHeight,
            screenBrightness,
            freeSpace,
            batteryLevel,
            batteryStatus,
            freeMemory
        ]) => {
            const dto: any = {
                'apiLevel': this.getApiLevel(),
                'osVersion': this.getOsVersion(),
                'deviceMake': this.getManufacturer(),
                'deviceModel': this.getModel(),
                'connectionType': connectionType,
                'networkType': networkType,
                'screenLayout': this.getScreenLayout(),
                'screenDensity': this.getScreenDensity(),
                'screenWidth': screenWidth,
                'screenHeight': screenHeight,
                'screenScale': this.getScreenScale(),
                'userInterfaceIdiom': this.getUserInterfaceIdiom(),
                'networkOperator': networkOperator,
                'networkOperatorName': networkOperatorName,
                'timeZone': this.getTimeZone(),
                'headset': headset,
                'language': this.getLanguage(),
                'deviceVolume': deviceVolume,
                'screenBrightness': screenBrightness,
                'freeSpaceInternal': freeSpace,
                'totalSpaceInternal': this.getTotalSpace(),
                'totalSpaceExternal': this.getTotalSpaceExternal(),
                'batteryLevel': batteryLevel,
                'batteryStatus': batteryStatus,
                'freeMemory': freeMemory,
                'totalMemory': this.getTotalMemory(),
                'rooted': this.isRooted(),
                'simulator': this.isSimulator(),
            };

            const sendDto = () => {
                if(this.getAdvertisingIdentifier()) {
                    dto.advertisingTrackingId = this.getAdvertisingIdentifier();
                    dto.limitAdTracking = this.getLimitAdTracking();
                } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    dto.androidId = this.getAndroidId();
                }
                return dto;
            };

            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                return Promise.all([
                    this.getFreeSpaceExternal().catch(err => this.handleDeviceInfoError(err)),
                    this.getRingerMode().catch(err => this.handleDeviceInfoError(err))
                ]).then(([
                    freeSpaceExternal,
                    ringerMode
                ]) => {
                    dto.freeSpaceExternal = freeSpaceExternal;
                    dto.ringerMode = ringerMode;
                    return sendDto();
                });
            } else {
                return sendDto();
            }
        });
    }

    public getStaticDTO(): any {
        const dto: any = {
            'apiLevel': this.getApiLevel(),
            'osVersion': this.getOsVersion(),
            'deviceMake': this.getManufacturer(),
            'deviceModel': this.getModel(),
            'screenLayout': this.getScreenLayout(),
            'screenDensity': this.getScreenDensity(),
            'screenWidth': this.getScreenWidth(),
            'screenHeight': this.getScreenHeight(),
            'screenScale': this.getScreenScale(),
            'userInterfaceIdiom': this.getUserInterfaceIdiom(),
            'timeZone': this.getTimeZone(),
            'language': this.getLanguage(),
            'totalSpaceInternal': this.getTotalSpace(),
            'totalSpaceExternal': this.getTotalSpaceExternal(),
            'totalMemory': this.getTotalMemory(),
            'rooted': this.isRooted(),
            'simulator': this.isSimulator(),
        };

        if(this.getAdvertisingIdentifier()) {
            dto.advertisingTrackingId = this.getAdvertisingIdentifier();
            dto.limitAdTracking = this.getLimitAdTracking();
        } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            dto.androidId = this.getAndroidId();
        }

        return dto;
    }

    private handleDeviceInfoError(error: any) {
        this._nativeBridge.Sdk.logWarning(JSON.stringify(error));
    }
}
