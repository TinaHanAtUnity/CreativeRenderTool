import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';
import { DeviceInfoEvent } from 'Native/Api/DeviceInfoEvent';
import { Observable2 } from 'Utilities/Observable';

export class IosDeviceInfoApi extends NativeApi {
    public readonly onVolumeChanged = new Observable2<number, number>();

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

    public getStatusBarWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getStatusBarWidth');
    }

    public isStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isStatusBarHidden');
    }

    public getDeviceMaxVolume(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getDeviceMaxVolume');
    }

    public registerVolumeChangeListener(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'registerVolumeChangeListener');
    }

    public unregisterVolumeChangeListener(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'unregisterVolumeChangeListener');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch (event) {
            case DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED]:
                this.onVolumeChanged.trigger(parameters[0], parameters[1]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
