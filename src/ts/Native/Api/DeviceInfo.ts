import { NativeApi } from 'Native/NativeApi';
import { StreamType } from 'Constants/Android/StreamType';
import { NativeBridge } from 'Native/NativeBridge';

export enum StorageType {
    EXTERNAL,
    INTERNAL
}

export class DeviceInfoApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');
    }

    public getAndroidId (): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAndroidId');
    }

    public getAdvertisingTrackingId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAdvertisingTrackingId');
    }

    public getLimitAdTrackingFlag(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getLimitAdTrackingFlag');
    }

    public getApiLevel (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getApiLevel');
    }

    public getOsVersion (): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getOsVersion');
    }

    public getManufacturer (): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getManufacturer');
    }

    public getModel (): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getModel');
    }

    public getScreenLayout (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenLayout');
    }

    public getScreenDensity (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenDensity');
    }

    public getScreenWidth (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenWidth');
    }

    public getScreenHeight (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenHeight');
    }

    public getTimeZone(dst: boolean): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getTimeZone', [dst]);
    }

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getConnectionType');
    }

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getNetworkType');
    }

    public getNetworkOperator(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperator');
    }

    public getNetworkOperatorName(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperatorName');
    }

    public isAppInstalled(packageName: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAppInstalled', [packageName]);
    }

    public isRooted(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isRooted');
    }

    public getInstalledPackages(md5: boolean): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getInstalledPackages', [md5]);
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getUniqueEventId');
    }

    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getHeadset');
    }

    public getSystemProperty(propertyName: string, defaultValue: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getSystemProperty', [propertyName, defaultValue]);
    }

    public getRingerMode (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getRingerMode');
    }

    public getSystemLanguage(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getSystemLanguage');
    }

    public getDeviceVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getDeviceVolume', [streamType]);
    }

    public getScreenBrightness (): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenBrightness');
    }

    public getFreeSpace (storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeSpace', [storageType]);
    }

    public getTotalSpace (storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalSpace', [storageType]);
    }

    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getBatteryLevel');
    }

    public getBatteryStatus(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getBatteryStatus');
    }

    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeMemory');
    }

    public getTotalMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalMemory');
    }

}


