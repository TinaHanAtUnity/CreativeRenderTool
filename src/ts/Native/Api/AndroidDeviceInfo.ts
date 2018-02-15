import { NativeApi } from 'Native/NativeApi';
import { StreamType } from 'Constants/Android/StreamType';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfoEvent } from 'Native/Api/DeviceInfo';
import { Observable3 } from 'Utilities/Observable';

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

export interface ISensorInfo {
    name: string;
    type: number;
    vendor: string;
    maximumRange: number;
    power: number;
    version: number;
    resolution: number;
    minDelay: number;
}

export class AndroidDeviceInfoApi extends NativeApi {
    public readonly onVolumeChanged = new Observable3<number, number, number>();

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

    public getDeviceMaxVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getDeviceMaxVolume', [streamType]);
    }

    public registerVolumeChangeListener(streamType: StreamType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'registerVolumeChangeListener', [streamType]);
    }

    public unregisterVolumeChangeListener(streamType: StreamType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'unregisterVolumeChangeListener', [streamType]);
    }

    public getFreeSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeSpace', [StorageType[storageType]]);
    }

    public getTotalSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalSpace', [StorageType[storageType]]);
    }

    public getSensorList(): Promise<ISensorInfo[]> {
        return this._nativeBridge.invoke<ISensorInfo[]>(this._apiClass, 'getSensorList');
    }

    public getBoard(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getBoard');
    }

    public getBootloader(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getBootloader');
    }

    public getBrand(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getBrand');
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

    public getFingerprint(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getFingerprint');
    }

    public getSupportedAbis(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getSupportedAbis');
    }

    public getUptime(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getUptime');
    }

    public getElapsedRealtime(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getElapsedRealtime');
    }

    public isUSBConnected(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isUSBConnected');
    }

    public isAdbEnabled(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAdbEnabled');
    }

    public getApkDigest(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getApkDigest');
    }

    public getCertificateFingerprint(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getCertificateFingerprint');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch (event) {
            case DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED]:
                this.onVolumeChanged.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
