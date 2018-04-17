import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidDeviceInfoApi } from 'Native/Api/AndroidDeviceInfo';
import { IosDeviceInfoApi } from 'Native/Api/IosDeviceInfo';
import { Platform } from 'Constants/Platform';

export enum DeviceInfoEvent {
    VOLUME_CHANGED
}

export class DeviceInfoApi extends NativeApi {
    public Android: AndroidDeviceInfoApi;
    public Ios: IosDeviceInfoApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosDeviceInfoApi(nativeBridge);
        } else {
            this.Android = new AndroidDeviceInfoApi(nativeBridge);
        }
    }

    public getAdvertisingTrackingId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAdvertisingTrackingId');
    }

    public getLimitAdTrackingFlag(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getLimitAdTrackingFlag');
    }

    public getOsVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getOsVersion');
    }

    public getModel(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getModel');
    }

    public getScreenWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenWidth');
    }

    public getScreenHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenHeight');
    }

    public getTimeZone(dst: boolean): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getTimeZone', [dst]);
    }

    public getTimeZoneOffset(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTimeZoneOffset');
    }

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getConnectionType');
    }

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getNetworkType');
    }

    public getNetworkMetered(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getNetworkMetered');
    }

    public getNetworkOperator(): Promise<string> {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperator').then(result => {
                if(typeof result === 'string') {
                    return result;
                } else {
                    return '';
                }
            });
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperator');
        }
    }

    public getNetworkOperatorName(): Promise<string> {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperatorName').then(result => {
                if(typeof result === 'string') {
                    return result;
                } else {
                    return '';
                }
            });
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperatorName');
        }
    }

    public isRooted(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isRooted');
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getUniqueEventId');
    }

    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getHeadset');
    }

    public getSystemLanguage(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getSystemLanguage');
    }

    public getScreenBrightness(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenBrightness');
    }

    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getBatteryLevel');
    }

    public getBatteryStatus(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getBatteryStatus');
    }

    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeMemory');
    }

    public getTotalMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalMemory');
    }

    public getGLVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getGLVersion');
    }

    public getCPUCount(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getCPUCount');
    }
}
