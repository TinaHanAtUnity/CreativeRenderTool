import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';

export class IosDeviceInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');
    }

    public getScreenScale(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getScreenScale');
    }

    public getUserInterfaceIdiom(): Promise<UIUserInterfaceIdiom> {
        return this._nativeBridge.invoke<UIUserInterfaceIdiom>(this._apiClass, 'getUserInterfaceIdiom');
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

    public getSensorList(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getSensorList');
    }

    public getStatusBarHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getStatusBarHeight');
    }
}
