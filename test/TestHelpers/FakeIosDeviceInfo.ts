import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';
import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { ICoreApi } from 'Core/ICore';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';

import IosDefaults from 'json/FakeIosDeviceInfo.json';

export class FakeIosDeviceInfo extends IosDeviceInfo {

    private _fakeDevice: any;

    constructor(core: ICoreApi) {
        super(core);
        this._fakeDevice = IosDefaults;
    }

    public fetch(): Promise<any[]> {
        return Promise.resolve(<any> void(0));
    }

    public getStores(): string {
        return 'apple';
    }

    public getAdvertisingIdentifier(): string {
        return this._fakeDevice.advertisingId;
    }

    public getLimitAdTracking(): boolean {
        return this._fakeDevice.trackingEnabled;
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

    public getScreenWidth(): Promise<number> {
        return Promise.resolve(this._fakeDevice.screenWidth);
    }

    public getScreenHeight(): Promise<number> {
        return Promise.resolve(this._fakeDevice.screenHeight);
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

    public getTotalSpace(): number {
        return this._fakeDevice.totalSpaceInternal;
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

    public getDeviceName(): string {
        return this._fakeDevice.deviceName;
    }

    public getVendorIdentifier(): string {
        return this._fakeDevice.vendorIdentifier;
    }

    public getLocaleList(): string[] {
        return this._fakeDevice.localeList;
    }

    public getCurrentUiTheme(): number {
        return this._fakeDevice.currentUiTheme;
    }

    public getAdNetworksPlist(): string[] {
        return this._fakeDevice.adNetworksPlist;
    }

    public getSystemBootTime(): number {
        return this._fakeDevice.systemBootTime;
    }

    public getTrackingAuthorizationStatus(): number {
        return this._fakeDevice.trackingAuthStatus;
    }

    public getDTO(): Promise<any> {
        return Promise.resolve(this._fakeDevice);
    }
}
