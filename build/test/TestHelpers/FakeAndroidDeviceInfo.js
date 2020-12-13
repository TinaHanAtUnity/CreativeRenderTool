import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import AndroidDefaults from 'json/FakeAndroidDeviceInfo.json';
export class FakeAndroidDeviceInfo extends AndroidDeviceInfo {
    constructor(core) {
        super(core);
        this._fakeDevice = AndroidDefaults;
    }
    fetch() {
        return Promise.resolve(void (0));
    }
    getStores() {
        return 'xiaomi,google';
    }
    getAndroidId() {
        return this._fakeDevice.androidId;
    }
    getAdvertisingIdentifier() {
        return this._fakeDevice.advertisingId;
    }
    getApkDigest() {
        return this._fakeDevice.apkDigest;
    }
    getLimitAdTracking() {
        return this._fakeDevice.trackingEnabled;
    }
    getApiLevel() {
        return this._fakeDevice.apiLevel;
    }
    getManufacturer() {
        return this._fakeDevice.deviceMake;
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
    getScreenLayout() {
        return this._fakeDevice.screenLayout;
    }
    getDisplayMetricDensity() {
        return this._fakeDevice.displayMetricDensity;
    }
    getScreenDensity() {
        return this._fakeDevice.screenDensity;
    }
    getScreenWidth() {
        return Promise.resolve(this._fakeDevice.screenWidth);
    }
    getScreenHeight() {
        return Promise.resolve(this._fakeDevice.screenHeight);
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
    getFreeSpaceExternal() {
        return Promise.resolve(this._fakeDevice.freeSpaceExternal);
    }
    getTotalSpace() {
        return this._fakeDevice.totalSpaceInternal;
    }
    getTotalSpaceExternal() {
        return this._fakeDevice.totalSpaceExternal;
    }
    getLanguage() {
        return this._fakeDevice.language;
    }
    getHeadset() {
        return Promise.resolve(this._fakeDevice.headset);
    }
    getRingerMode() {
        return Promise.resolve(this._fakeDevice.ringerMode);
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
    getDTO() {
        return Promise.resolve(this._fakeDevice);
    }
}
export class FakeXiaomiDeviceInfo extends AndroidDeviceInfo {
    constructor(core) {
        super(core);
        this._fakeDevice = AndroidDefaults;
    }
    fetch() {
        return Promise.resolve(void (0));
    }
    isXiaomiStoreInstalled() {
        return true;
    }
    isGoogleStoreInstalled() {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUFuZHJvaWREZXZpY2VJbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9UZXN0SGVscGVycy9GYWtlQW5kcm9pZERldmljZUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFbEUsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFFOUQsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGlCQUFpQjtJQUl4RCxZQUFZLElBQWM7UUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUM7SUFDdkMsQ0FBQztJQUVNLEtBQUs7UUFDUixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU8sS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFDdEMsQ0FBQztJQUVNLHdCQUF3QjtRQUMzQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO0lBQzFDLENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUM7SUFDNUMsQ0FBQztJQUVNLFdBQVc7UUFDZCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFFTSxlQUFlO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7SUFDdkMsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFD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