import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import IosDefaults from 'json/FakeIosDeviceInfo.json';
export class FakeIosDeviceInfo extends IosDeviceInfo {
    constructor(core) {
        super(core);
        this._fakeDevice = IosDefaults;
    }
    fetch() {
        return Promise.resolve(void (0));
    }
    getStores() {
        return 'apple';
    }
    getAdvertisingIdentifier() {
        return this._fakeDevice.advertisingId;
    }
    getLimitAdTracking() {
        return this._fakeDevice.trackingEnabled;
    }
    getModel() {
        return this._fakeDevice.deviceModel;
    }
    getNetworkType() {
        return Promise.resolve(this._fakeDevice.networkType);
    }
    getNetworkOperator() {
        return Promise.resolve(this._fakeDevice.networkOperator);
    }
    getNetworkOperatorName() {
        return Promise.resolve(this._fakeDevice.networkOperatorName);
    }
    getOsVersion() {
        return this._fakeDevice.osVersion;
    }
    getScreenWidth() {
        return Promise.resolve(this._fakeDevice.screenWidth);
    }
    getScreenHeight() {
        return Promise.resolve(this._fakeDevice.screenHeight);
    }
    getScreenScale() {
        return this._fakeDevice.screenScale;
    }
    getUserInterfaceIdiom() {
        return this._fakeDevice.userInterfaceIdiom;
    }
    isRooted() {
        return this._fakeDevice.rooted;
    }
    getConnectionType() {
        return Promise.resolve(this._fakeDevice.connectionType);
    }
    getTimeZone() {
        return this._fakeDevice.timeZone;
    }
    getFreeSpace() {
        return Promise.resolve(this._fakeDevice.freeSpaceInternal);
    }
    getTotalSpace() {
        return this._fakeDevice.totalSpaceInternal;
    }
    getLanguage() {
        return this._fakeDevice.language;
    }
    isSimulator() {
        return this._fakeDevice.simulator;
    }
    getHeadset() {
        return Promise.resolve(this._fakeDevice.headset);
    }
    getDeviceVolume() {
        return Promise.resolve(this._fakeDevice.deviceVolume);
    }
    getScreenBrightness() {
        return Promise.resolve(this._fakeDevice.screenBrightness);
    }
    getBatteryLevel() {
        return Promise.resolve(this._fakeDevice.batteryLevel);
    }
    getBatteryStatus() {
        return Promise.resolve(this._fakeDevice.batteryStatus);
    }
    getFreeMemory() {
        return Promise.resolve(this._fakeDevice.freeMemory);
    }
    getTotalMemory() {
        return this._fakeDevice.totalMemory;
    }
    getDeviceName() {
        return this._fakeDevice.deviceName;
    }
    getVendorIdentifier() {
        return this._fakeDevice.vendorIdentifier;
    }
    getLocaleList() {
        return this._fakeDevice.localeList;
    }
    getCurrentUiTheme() {
        return this._fakeDevice.currentUiTheme;
    }
    getAdNetworksPlist() {
        return this._fakeDevice.adNetworksPlist;
    }
    getSystemBootTime() {
        return this._fakeDevice.systemBootTime;
    }
    getTrackingAuthorizationStatus() {
        return this._fakeDevice.trackingAuthStatus;
    }
    getDTO() {
        return Promise.resolve(this._fakeDevice);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUlvc0RldmljZUluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L1Rlc3RIZWxwZXJzL0Zha2VJb3NEZXZpY2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxPQUFPLFdBQVcsTUFBTSw2QkFBNkIsQ0FBQztBQUV0RCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsYUFBYTtJQUloRCxZQUFZLElBQWM7UUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDbkMsQ0FBQztJQUVNLEtBQUs7UUFDUixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU8sS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sd0JBQXdCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7SUFDMUMsQ0FBQztJQUVNLGtCQUFrQjtRQUNyQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDO0lBQzVDLENBQUM7SUFFTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztJQUN4QyxDQUFDO0lBRU0sY0FBYztRQUNqQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTSxzQkFBc0I7UUFDekIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1C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