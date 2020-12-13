import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfoApi } from 'Core/Native/Android/DeviceInfo';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { IosDeviceInfoApi } from 'Core/Native/iOS/DeviceInfo';
export class DeviceInfoApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE);
        if (nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosDeviceInfoApi(nativeBridge);
        }
        else {
            this.Android = new AndroidDeviceInfoApi(nativeBridge);
        }
    }
    getAdvertisingTrackingId() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getAdvertisingTrackingId');
    }
    getLimitAdTrackingFlag() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getLimitAdTrackingFlag');
    }
    getOsVersion() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getOsVersion');
    }
    getModel() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getModel');
    }
    getScreenWidth() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getScreenWidth');
    }
    getScreenHeight() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getScreenHeight');
    }
    getTimeZone(dst) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTimeZone', [dst]);
    }
    getTimeZoneOffset() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTimeZoneOffset');
    }
    getConnectionType() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getConnectionType');
    }
    getNetworkType() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getNetworkType');
    }
    getNetworkOperator() {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke(this._fullApiClassName, 'getNetworkOperator').then(result => {
                if (typeof result === 'string') {
                    return result;
                }
                else {
                    return '';
                }
            });
        }
        else {
            return this._nativeBridge.invoke(this._fullApiClassName, 'getNetworkOperator');
        }
    }
    getNetworkOperatorName() {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke(this._fullApiClassName, 'getNetworkOperatorName').then(result => {
                if (typeof result === 'string') {
                    return result;
                }
                else {
                    return '';
                }
            });
        }
        else {
            return this._nativeBridge.invoke(this._fullApiClassName, 'getNetworkOperatorName');
        }
    }
    isRooted() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isRooted');
    }
    getUniqueEventId() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getUniqueEventId');
    }
    getHeadset() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getHeadset');
    }
    getSystemLanguage() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSystemLanguage');
    }
    getScreenBrightness() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getScreenBrightness');
    }
    getBatteryLevel() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBatteryLevel');
    }
    getBatteryStatus() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getBatteryStatus');
    }
    getFreeMemory() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFreeMemory');
    }
    getTotalMemory() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTotalMemory');
    }
    getGLVersion() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getGLVersion');
    }
    getCPUCount() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCPUCount');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9EZXZpY2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTlELE1BQU0sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUl4QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzdDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqRDthQUFNO1lBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQztJQUVNLHdCQUF3QjtRQUMzQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFTLElBQUksQ0FBQyxpQkFBaUIsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFTSxzQkFBc0I7UUFDekIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVMsSUFBSSxDQUFDLGlCQUFp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