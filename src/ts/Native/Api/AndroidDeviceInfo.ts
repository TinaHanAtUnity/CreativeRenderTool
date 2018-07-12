import { NativeApi } from 'Native/NativeApi';
import { StreamType } from 'Constants/Android/StreamType';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfoEvent } from 'Native/Api/DeviceInfoEvent';
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
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getAndroidId');
    }

    public getApiLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getApiLevel');
    }

    public getManufacturer(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getManufacturer');
    }

    public getScreenLayout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getScreenLayout');
    }

    public getScreenDensity(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getScreenDensity');
    }

    public isAppInstalled(packageName: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isAppInstalled', [packageName]);
    }

    public getInstalledPackages(md5: boolean): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this.getFullApiClassName(), 'getInstalledPackages', [md5]);
    }

    public getPackageInfo(packageName: string): Promise<IPackageInfo> {
        return this._nativeBridge.invoke<IPackageInfo>(this.getFullApiClassName(), 'getPackageInfo', [packageName]);
    }

    public getSystemProperty(propertyName: string, defaultValue: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getSystemProperty', [propertyName, defaultValue]);
    }

    public getRingerMode(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getRingerMode');
    }

    public getDeviceVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getDeviceVolume', [streamType]);
    }

    public getDeviceMaxVolume(streamType: StreamType): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getDeviceMaxVolume', [streamType]);
    }

    public registerVolumeChangeListener(streamType: StreamType): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'registerVolumeChangeListener', [streamType]);
    }

    public unregisterVolumeChangeListener(streamType: StreamType): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'unregisterVolumeChangeListener', [streamType]);
    }

    public getFreeSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getFreeSpace', [StorageType[storageType]]);
    }

    public getTotalSpace(storageType: StorageType): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getTotalSpace', [StorageType[storageType]]);
    }

    public getSensorList(): Promise<ISensorInfo[]> {
        return this._nativeBridge.invoke<ISensorInfo[]>(this.getFullApiClassName(), 'getSensorList');
    }

    public getBoard(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getBoard');
    }

    public getBootloader(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getBootloader');
    }

    public getBrand(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getBrand');
    }

    public getDevice(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getDevice');
    }

    public getHardware(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getHardware');
    }

    public getHost(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getHost');
    }

    public getProduct(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getProduct');
    }

    public getFingerprint(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getFingerprint');
    }

    public getSupportedAbis(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this.getFullApiClassName(), 'getSupportedAbis');
    }

    public getUptime(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getUptime');
    }

    public getElapsedRealtime(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getElapsedRealtime');
    }

    public isUSBConnected(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isUSBConnected');
    }

    public isAdbEnabled(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isAdbEnabled');
    }

    public getApkDigest(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getApkDigest');
    }

    public getCertificateFingerprint(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getCertificateFingerprint');
    }

    public getBuildId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getBuildId');
    }

    public getBuildVersionIncremental(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getBuildVersionIncremental');
    }

    public getNetworkMetered(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getNetworkMetered');
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
