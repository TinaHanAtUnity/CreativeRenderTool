import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidDeviceInfoApi } from 'Native/Api/AndroidDeviceInfo';
import { IosDeviceInfoApi } from 'Native/Api/IosDeviceInfo';
import { Platform } from 'Constants/Platform';

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

    public getConnectionType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getConnectionType');
    }

    public getNetworkType(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getNetworkType');
    }

    public getNetworkOperator(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperator');
    }

    public getNetworkOperatorName(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getNetworkOperatorName');
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

    public getGLString(property: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getGLString', [property]);
    }
}
