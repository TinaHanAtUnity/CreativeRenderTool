import { NativeApi } from 'Native/NativeApi';
import { StreamType } from 'Constants/Android/StreamType';
import { NativeBridge } from 'Native/NativeBridge';

export enum StorageType {
    EXTERNAL,
    INTERNAL
}

export interface IPackageInfo {
    installer: string;
    firstInstallTime: number;
    lastUpdateTime: number;
    versionCode: number;
    versionName: string;
    packageName: string;
}

export class AndroidDeviceInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');
    }

    public getAndroidId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAndroidId');
    }

    public getApiLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getApiLevel');
    }

    public getManufacturer(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getManufacturer');
    }

    public getScreenLayout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenLayout');
    }

    public getScreenDensity(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenDensity');
    }

    public isAppInstalled(packageName: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAppInstalled', [packageName]);
    }

    public getInstalledPackages(md5: boolean): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getInstalledPackages', [md5]);
    }

    public getPackageInfo(packageName: string): Promise<IPackageInfo> {
        return this._nativeBridge.invoke<IPackageInfo>(this._apiClass, 'getPackageInfo', [packageName]);
    }

    public getSystemProperty(propertyName: string, defaultValue: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getSystemProperty', [propertyName, defaultValue]);
    }

    public getRingerMode(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getRingerMode');
    }

    public getDeviceVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getDeviceVolume', [streamType]);
    }

    public getFreeSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeSpace', [StorageType[storageType]]);
    }

    public getTotalSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalSpace', [StorageType[storageType]]);
    }

    public getSensorList(): Promise<any[]> {
        return this._nativeBridge.invoke<any[]>(this._apiClass, 'getSensorList');
    }

    public getBoard(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getBoard');
    }

    public getBootloader(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getBootloader');
    }

    public getDevice(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getDevice');
    }

    public getHardware(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getHardware');
    }

    public getHost(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getHost');
    }

    public getProduct(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getProduct');
    }

    public getSupportedAbis(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getSupportedAbis');
    }
}
