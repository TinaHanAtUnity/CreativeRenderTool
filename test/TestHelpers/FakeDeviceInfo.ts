import { BatteryStatus } from 'Constants/Android/BatteryStatus';
import { RingerMode } from 'Constants/Android/RingerMode';
import { Platform } from 'Constants/Platform';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';
import { DeviceInfo } from 'Models/DeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';

interface IDeviceData {
    androidId?: string;
    advertisingId: string;
    trackingEnabled: boolean;
    apiLevel?: number;
    osVersion: string;
    deviceMake?: string;
    deviceModel: string;
    connectionType: string;
    networkType: number;
    screenLayout?: number;
    screenDensity?: number;
    screenWidth: number;
    screenHeight: number;
    screenScale?: number;
    userInterfaceIdiom?: UIUserInterfaceIdiom;
    networkOperator: string;
    networkOperatorName: string;
    timeZone: string;
    headset: boolean;
    ringerMode?: RingerMode;
    language: string;
    deviceVolume: number;
    screenBrightness: number;
    freeSpaceInternal: number;
    totalSpaceInternal: number;
    freeSpaceExternal?: number;
    totalSpaceExternal?: number;
    batteryLevel: number;
    batteryStatus: BatteryStatus;
    freeMemory: number;
    totalMemory: number;
    rooted: boolean;
    simulator?: boolean;
}

export class FakeDeviceInfo extends DeviceInfo {
    private static AndroidDefaults: IDeviceData = {
        advertisingId: '12345678-9ABC-DEF0-1234-56789ABCDEF0',
        trackingEnabled: false,
        osVersion: '1.0',
        deviceModel: 'TestModel',
        screenWidth: 567,
        screenHeight: 1234,
        language: 'en_US',
        rooted: false,
        timeZone: '+0200',
        totalMemory: 12345678,
        androidId: '1234567890abcdef',
        apiLevel: 20,
        totalSpaceExternal: 123456789,
        totalSpaceInternal: 12345678,
        deviceMake: 'Test manufacturer',
        screenDensity: 320,
        screenLayout: 268435796,
        connectionType: 'cellular',
        networkType: 1,
        networkOperator: '00101',
        networkOperatorName: 'Test operator',
        headset: false,
        deviceVolume: 1,
        screenBrightness: 100,
        freeSpaceInternal: 1234567,
        batteryLevel: 0.5,
        batteryStatus: 1,
        freeMemory: 1234567,
        freeSpaceExternal: 12345678,
        ringerMode: 2
    };
    private static IosDefaults: IDeviceData = {
        advertisingId: '12345678-9ABC-DEF0-1234-56789ABCDEF0',
        trackingEnabled: false,
        osVersion: '1.0',
        deviceModel: 'TestModel',
        screenWidth: 567,
        screenHeight: 1234,
        language: 'en_US',
        rooted: false,
        timeZone: '+0200',
        totalMemory: 12345678,
        userInterfaceIdiom: 1,
        screenScale: 2,
        simulator: false,
        totalSpaceInternal: 123456789,
        connectionType: 'cellular',
        networkType: 1,
        networkOperator: '00101',
        networkOperatorName: 'Test operator',
        headset: false,
        deviceVolume: 1,
        screenBrightness: 100,
        freeSpaceInternal: 1234567,
        batteryLevel: 0.5,
        batteryStatus: 1,
        freeMemory: 1234567,
    };

    private _platform: Platform;
    private _fakeDevice: any;

    constructor(nativeBridge: NativeBridge, platform: Platform) {
        super(nativeBridge);
        this._platform = platform;
        if(platform === Platform.IOS) {
            this._fakeDevice = FakeDeviceInfo.IosDefaults;
        } else {
            this._fakeDevice = FakeDeviceInfo.AndroidDefaults;
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