import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { DeviceInfoEvent } from 'Core/Native/DeviceInfoEvent';
import { Observable3 } from 'Core/Utilities/Observable';
export var StorageType;
(function (StorageType) {
    StorageType[StorageType["EXTERNAL"] = 0] = "EXTERNAL";
    StorageType[StorageType["INTERNAL"] = 1] = "INTERNAL";
})(StorageType || (StorageType = {}));
export class AndroidDeviceInfoApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE, EventCategory.DEVICEINFO);
        this.onVolumeChanged = new Observable3();
    }
    getAndroidId() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getAndroidId');
    }
    getApiLevel() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getApiLevel');
    }
    getManufacturer() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getManufacturer');
    }
    getScreenLayout() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getScreenLayout');
    }
    getDisplayMetricDensity() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDisplayMetricDensity');
    }
    getScreenDensity() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getScreenDensity');
    }
    getPackageInfo(packageName) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getPackageInfo', [packageName]);
    }
    getSystemProperty(propertyName, defaultValue) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSystemProperty', [propertyName, defaultValue]);
    }
    getRingerMode() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getRingerMode');
    }
    getDeviceVolume(streamType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDeviceVolume', [streamType]);
    }
    getDeviceMaxVolume(streamType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDeviceMaxVolume', [streamType]);
    }
    registerVolumeChangeListener(streamType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'registerVolumeChangeListener', [streamType]);
    }
    unregisterVolumeChangeListener(streamType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'unregisterVolumeChangeListener', [streamType]);
    }
    getFreeSpace(storageType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFreeSpace', [StorageType[storageType]]);
    }
    getTotalSpace(storageType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTotalSpace', [StorageType[storageType]]);
    }
    getSensorList() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSensorList');
    }
    getBoard() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBoard');
    }
    getBootloader() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBootloader');
    }
    getBrand() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBrand');
    }
    getDevice() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDevice');
    }
    getHardware() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getHardware');
    }
    getHost() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getHost');
    }
    getProduct() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getProduct');
    }
    getFingerprint() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFingerprint');
    }
    getSupportedAbis() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSupportedAbis');
    }
    getUptime() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getUptime');
    }
    getElapsedRealtime() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getElapsedRealtime');
    }
    isUSBConnected() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isUSBConnected');
    }
    isAdbEnabled() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isAdbEnabled');
    }
    getApkDigest() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getApkDigest');
    }
    getCertificateFingerprint() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCertificateFingerprint');
    }
    getBuildId() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBuildId');
    }
    getBuildVersionIncremental() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBuildVersionIncremental');
    }
    getNetworkMetered() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getNetworkMetered');
    }
    handleEvent(event, parameters) {
        switch (event) {
            case DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED]:
                this.onVolumeChanged.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9BbmRyb2lkL0RldmljZUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxNQUFNLENBQU4sSUFBWSxXQUdYO0FBSEQsV0FBWSxXQUFXO0lBQ25CLHFEQUFRLENBQUE7SUFDUixxREFBUSxDQUFBO0FBQ1osQ0FBQyxFQUhXLFdBQVcsS0FBWCxXQUFXLFFBR3RCO0FBc0JELE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxTQUFTO0lBRy9DLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFIakUsb0JBQWUsR0FBRyxJQUFJLFdBQVcsRUFBMEIsQ0FBQztJQUk1RSxDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFTSxXQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBUyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVNLGVBQWU7UUFDbEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBUyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMs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