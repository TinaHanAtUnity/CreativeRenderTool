import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { AndroidDeviceInfoApi } from 'Common/Native/Api/Android/AndroidDeviceInfo';
import { IosDeviceInfoApi } from 'Common/Native/Api/iOS/IosDeviceInfo';
import { Platform } from 'Common/Constants/Platform';

export class DeviceInfoApi extends NativeApi {
    public Android: AndroidDeviceInfoApi;
    public Ios: IosDeviceInfoApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosDeviceInfoApi(nativeBridge);
        } else {
            this.Android = new AndroidDeviceInfoApi(nativeBridge);
        }
    }

    public getAdvertisingTrackingId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getAdvertisingTrackingId');
    }

    public getLimitAdTrackingFlag(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getLimitAdTrackingFlag');
    }

    public getOsVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getOsVersion');
    }

    public getModel(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getModel');
    }

    public getScreenWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getScreenWidth');
    }

    public getScreenHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getScreenHeight');
    }

    public getTimeZone(dst: boolean): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getTimeZone', [dst]);
    }

    public getTimeZoneOffset(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getTimeZoneOffset');
    }

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getConnectionType');
    }

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getNetworkType');
    }

    public getNetworkOperator(): Promise<string> {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getNetworkOperator').then(result => {
                if(typeof result === 'string') {
                    return result;
                } else {
                    return '';
                }
            });
        } else {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getNetworkOperator');
        }
    }

    public getNetworkOperatorName(): Promise<string> {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getNetworkOperatorName').then(result => {
                if(typeof result === 'string') {
                    return result;
                } else {
                    return '';
                }
            });
        } else {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getNetworkOperatorName');
        }
    }

    public isRooted(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isRooted');
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getUniqueEventId');
    }

    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getHeadset');
    }

    public getSystemLanguage(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getSystemLanguage');
    }

    public getScreenBrightness(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getScreenBrightness');
    }

    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getBatteryLevel');
    }

    public getBatteryStatus(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getBatteryStatus');
    }

    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getFreeMemory');
    }

    public getTotalMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getTotalMemory');
    }

    public getGLVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getGLVersion');
    }

    public getCPUCount(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getCPUCount');
    }
}
