import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class IosDeviceInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');
    }

    public getScreenScale(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenScale');
    }

    public getUserInterfaceIdiom(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getUserInterfaceIdiom');
    }

    public getDeviceVolume(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getDeviceVolume');
    }

    public getFreeSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeSpace');
    }

    public getTotalSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalSpace');
    }

    public isSimulator(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isSimulator');
    }

    public isAppleWatchPaired(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAppleWatchPaired');
    }
}