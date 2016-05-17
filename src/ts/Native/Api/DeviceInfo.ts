import { NativeApi } from 'Native/NativeApi';
import { StreamType } from 'Constants/Android/StreamType';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidDeviceInfoApi } from 'Native/Api/AndroidDeviceInfo';
import { IosDeviceInfoApi } from 'Native/Api/IosDeviceInfo';
import { Platform } from 'Constants/Platform';

export enum StorageType {
    EXTERNAL,
    INTERNAL
}

export class DeviceInfoApi extends NativeApi {
    public Android: AndroidDeviceInfoApi;
    public Ios: IosDeviceInfoApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosDeviceInfoApi(nativeBridge);
        } else {
            this.Android = new AndroidDeviceInfoApi(nativeBridge);
        }
    }

    // android
    public getAndroidId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAndroidId');
    }

    // android, ios
    public getAdvertisingTrackingId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAdvertisingTrackingId');
    }

    // android, ios
    public getLimitAdTrackingFlag(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getLimitAdTrackingFlag');
    }

    // android
    public getApiLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getApiLevel');
    }

    // android, ios
    public getOsVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getOsVersion');
    }

    // android
    public getManufacturer(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getManufacturer');
    }

    // android
    public getModel(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getModel');
    }

    // android, ios
    public getScreenLayout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenLayout');
    }

    // android
    public getScreenDensity(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenDensity');
    }

    // android, ios
    public getScreenWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenWidth');
    }

    // android, ios
    public getScreenHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenHeight');
    }

    // ios
    public getScreenScale(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenScale');
    }

    // ios
    public getUserInterfaceIdiom(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getUserInterfaceIdiom');
    }

    // android, ios
    public getTimeZone(dst: boolean): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getTimeZone', [dst]);
    }

    // android, ios
    public getConnectionType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getConnectionType');
    }

    // android, ios
    public getNetworkType(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getNetworkType');
    }

    // android, ios
    public getNetworkOperator(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperator');
    }

    // android, ios
    public getNetworkOperatorName(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperatorName');
    }

    // android
    public isAppInstalled(packageName: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAppInstalled', [packageName]);
    }

    // android, ios
    public isRooted(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isRooted');
    }

    // android
    public getInstalledPackages(md5: boolean): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getInstalledPackages', [md5]);
    }

    // android, ios
    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getUniqueEventId');
    }

    // android, ios
    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getHeadset');
    }

    // android
    public getSystemProperty(propertyName: string, defaultValue: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getSystemProperty', [propertyName, defaultValue]);
    }

    // android
    public getRingerMode(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getRingerMode');
    }

    // android, ios
    public getSystemLanguage(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getSystemLanguage');
    }

    // android, ios NO ARGUMENTS
    public getDeviceVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getDeviceVolume', [streamType]);
    }

    // android, ios
    public getScreenBrightness(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenBrightness');
    }

    // android, ios NO ARGUMENTS
    public getFreeSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeSpace', [StorageType[storageType]]);
    }

    // android, ios NO ARGUMENTS
    public getTotalSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalSpace', [StorageType[storageType]]);
    }

    // android, ios
    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getBatteryLevel');
    }

    // android, ios
    public getBatteryStatus(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getBatteryStatus');
    }

    // android, ios
    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeMemory');
    }

    // android, ios
    public getTotalMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalMemory');
    }

    // ios
    public isSimulator(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isSimulator');
    }

    // ios
    public isAppleWatchPaired(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAppleWatchPaired');
    }
}