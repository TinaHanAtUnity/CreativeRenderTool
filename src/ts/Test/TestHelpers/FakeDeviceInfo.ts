import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Platform } from 'Constants/Platform';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';
import { DeviceInfo } from 'Models/DeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';
import AndroidDefaults from 'json/FakeAndroidDeviceInfo.json';
import IosDefaults from 'json/FakeIosDeviceInfo.json';

export class FakeDeviceInfo extends DeviceInfo {
    private _platform: Platform;
    private _fakeDevice: any;

    constructor(nativeBridge: NativeBridge, platform: Platform) {
        super(nativeBridge);
        this._platform = platform;
        if(platform === Platform.IOS) {
            this._fakeDevice = JSON.parse(IosDefaults);
        } else {
            this._fakeDevice = JSON.parse(AndroidDefaults);
        }
    }

    public fetch(): Promise<any[]> {
        return Promise.resolve();
    }

    public getAndroidId(): string {
        return this._fakeDevice.androidId;
    }

    public getAdvertisingIdentifier(): string {
        return this._fakeDevice.advertisingId;
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

    public getScreenWidth(): number {
        return this._fakeDevice.screenWidth;
    }

    public getScreenHeight(): number {
        return this._fakeDevice.screenHeight;
    }

    public getScreenScale(): number {
        return this._fakeDevice.screenScale;
    }

    public getUserInterfaceIdiom(): UIUserInterfaceIdiom {
        return this._fakeDevice.userInterfaceIdiom;
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

    public isSimulator(): boolean {
        return this._fakeDevice.simulator;
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
