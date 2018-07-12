import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidDeviceInfoApi } from 'Native/Api/AndroidDeviceInfo';
import { IosDeviceInfoApi } from 'Native/Api/IosDeviceInfo';
import { Platform } from 'Constants/Platform';

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
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getAdvertisingTrackingId');
    }

    public getLimitAdTrackingFlag(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getLimitAdTrackingFlag');
    }

    public getOsVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getOsVersion');
    }

    public getModel(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getModel');
    }

    public getScreenWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getScreenWidth');
    }

    public getScreenHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getScreenHeight');
    }

    public getTimeZone(dst: boolean): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getTimeZone', [dst]);
    }

    public getTimeZoneOffset(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getTimeZoneOffset');
    }

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getConnectionType');
    }

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getNetworkType');
    }

    public getNetworkOperator(): Promise<string> {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getNetworkOperator').then(result => {
                if(typeof result === 'string') {
                    return result;
                } else {
                    return '';
                }
            });
        } else {
            return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getNetworkOperator');
        }
    }

    public getNetworkOperatorName(): Promise<string> {
        // note: iOS device without a SIM card will return an empty reply instead of a string. This is a quick workaround.
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getNetworkOperatorName').then(result => {
                if(typeof result === 'string') {
                    return result;
                } else {
                    return '';
                }
            });
        } else {
            return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getNetworkOperatorName');
        }
    }

    public isRooted(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isRooted');
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getUniqueEventId');
    }

    public getHeadset(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getHeadset');
    }

    public getSystemLanguage(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getSystemLanguage');
    }

    public getScreenBrightness(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getScreenBrightness');
    }

    public getBatteryLevel(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getBatteryLevel');
    }

    public getBatteryStatus(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getBatteryStatus');
    }

    public getFreeMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getFreeMemory');
    }

    public getTotalMemory(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getTotalMemory');
    }

    public getGLVersion(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getGLVersion');
    }

    public getCPUCount(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getCPUCount');
    }
}
