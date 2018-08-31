import { StreamType } from 'Common/Constants/Android/StreamType';
import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Observable3 } from 'Common/Utilities/Observable';
import { DeviceInfoEvent } from 'Core/Native/DeviceInfoEvent';

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
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE);
    }

    public getAndroidId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getAndroidId');
    }

    public getApiLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getApiLevel');
    }

    public getManufacturer(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getManufacturer');
    }

    public getScreenLayout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getScreenLayout');
    }

    public getScreenDensity(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getScreenDensity');
    }

    public isAppInstalled(packageName: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isAppInstalled', [packageName]);
    }

    public getInstalledPackages(md5: boolean): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._fullApiClassName, 'getInstalledPackages', [md5]);
    }

    public getPackageInfo(packageName: string): Promise<IPackageInfo> {
        return this._nativeBridge.invoke<IPackageInfo>(this._fullApiClassName, 'getPackageInfo', [packageName]);
    }

    public getSystemProperty(propertyName: string, defaultValue: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getSystemProperty', [propertyName, defaultValue]);
    }

    public getRingerMode(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getRingerMode');
    }

    public getDeviceVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getDeviceVolume', [streamType]);
    }

    public getDeviceMaxVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getDeviceMaxVolume', [streamType]);
    }

    public registerVolumeChangeListener(streamType: StreamType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'registerVolumeChangeListener', [streamType]);
    }

    public unregisterVolumeChangeListener(streamType: StreamType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'unregisterVolumeChangeListener', [streamType]);
    }

    public getFreeSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getFreeSpace', [StorageType[storageType]]);
    }

    public getTotalSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getTotalSpace', [StorageType[storageType]]);
    }

    public getSensorList(): Promise<ISensorInfo[]> {
        return this._nativeBridge.invoke<ISensorInfo[]>(this._fullApiClassName, 'getSensorList');
    }

    public getBoard(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getBoard');
    }

    public getBootloader(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getBootloader');
    }

    public getBrand(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getBrand');
    }

    public getDevice(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getDevice');
    }

    public getHardware(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getHardware');
    }

    public getHost(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getHost');
    }

    public getProduct(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getProduct');
    }

    public getFingerprint(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getFingerprint');
    }

    public getSupportedAbis(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._fullApiClassName, 'getSupportedAbis');
    }

    public getUptime(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getUptime');
    }

    public getElapsedRealtime(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getElapsedRealtime');
    }

    public isUSBConnected(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isUSBConnected');
    }

    public isAdbEnabled(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isAdbEnabled');
    }

    public getApkDigest(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getApkDigest');
    }

    public getCertificateFingerprint(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getCertificateFingerprint');
    }

    public getBuildId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getBuildId');
    }

    public getBuildVersionIncremental(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getBuildVersionIncremental');
    }

    public getNetworkMetered(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getNetworkMetered');
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
