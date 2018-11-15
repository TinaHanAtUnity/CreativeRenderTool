import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { ICoreApi } from 'Core/ICore';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

import AndroidDefaults from 'json/FakeAndroidDeviceInfo.json';

export class FakeAndroidDeviceInfo extends AndroidDeviceInfo {

    private _fakeDevice: any;

    constructor(core: ICoreApi) {
        super(core);
        this._fakeDevice = JSON.parse(AndroidDefaults);
    }

    public fetch(): Promise<any[]> {
        return Promise.resolve(<any>void(0));
    }

    public getStores(): string {
        return 'xiaomi,google';
    }

    public getAndroidId(): string {
        return this._fakeDevice.androidId;
    }

    public getAdvertisingIdentifier(): string {
        return this._fakeDevice.advertisingId;
    }

    public getApkDigest(): string {
        return this._fakeDevice.apkDigest;
    }

    public getLimitAdTracking(): boolean {
        return this._fakeDevice.trackingEnabled;
    }

    public getApiLevel(): number {
        return this._fakeDevice.apiLevel;
    }

    public getManufacturer(): string {
        return this._fakeDevice.deviceMake;
    }

    public getModel(): string {
        return this._fakeDevice.deviceModel;
    }

    public getNetworkType(): Promise<number> {
        return Promise.resolve(this._fakeDevice.networkType);
    }

    public getNetworkOperator(): Promise<string> {
        return Promise.resolve(this._fakeDevice.networkOperator);
    }

    public getNetworkOperatorName(): Promise<string> {
        return Promise.resolve(this._fakeDevice.networkOperatorName);
    }

    public getOsVersion(): string {
        return this._fakeDevice.osVersion;
    }

    public getScreenLayout(): number {
        return this._fakeDevice.screenLayout;
    }

    public getScreenDensity(): number {
        return this._fakeDevice.screenDensity;
    }

    public getScreenWidth(): Promise<number> {
        return Promise.resolve(this._fakeDevice.screenWidth);
    }

    public getScreenHeight(): Promise<number> {
        return Promise.resolve(this._fakeDevice.screenHeight);
    }

    public isRooted(): boolean {
        return this._fakeDevice.rooted;
    }

    public getConnectionType(): Promise<string> {
        return Promise.resolve(this._fakeDevice.connectionType);
    }

    public getTimeZone(): string {
        return this._fakeDevice.timeZone;
    }

    public getFreeSpace(): Promise<number> {
        return Promise.resolve(this._fakeDevice.freeSpaceInternal);
    }

    public getFreeSpaceExternal(): Promise<number> {
        return Promise.resolve(this._fakeDevice.freeSpaceExternal);
    }

    public getTotalSpace(): number {
        return this._fakeDevice.totalSpaceInternal;
    }

    public getTotalSpaceExternal(): number {
        return this._fakeDevice.totalSpaceExternal;
    }

    public getLanguage(): string {
        return this._fakeDevice.language;
    }

    public getHeadset(): Promise<boolean> {
        return Promise.resolve(this._fakeDevice.headset);
    }

    public getRingerMode(): Promise<RingerMode> {
        return Promise.resolve(this._fakeDevice.ringerMode);
    }

    public getDeviceVolume(): Promise<number> {
        return Promise.resolve(this._fakeDevice.deviceVolume);
    }

    public getScreenBrightness(): Promise<number> {
        return Promise.resolve(this._fakeDevice.screenBrightness);
    }

    public getBatteryLevel(): Promise<number> {
        return Promise.resolve(this._fakeDevice.batteryLevel);
    }

    public getBatteryStatus(): Promise<BatteryStatus> {
        return Promise.resolve(this._fakeDevice.batteryStatus);
    }

    public getFreeMemory(): Promise<number> {
        return Promise.resolve(this._fakeDevice.freeMemory);
    }

    public getTotalMemory(): number {
        return this._fakeDevice.totalMemory;
    }

    public getDTO(): Promise<any> {
        return Promise.resolve(this._fakeDevice);
    }
}
