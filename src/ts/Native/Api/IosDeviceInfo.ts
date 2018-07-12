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
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getScreenScale');
    }

    public getUserInterfaceIdiom(): Promise<UIUserInterfaceIdiom> {
        return this._nativeBridge.invoke<UIUserInterfaceIdiom>(this.getFullApiClassName(), 'getUserInterfaceIdiom');
    }

    public getDeviceVolume(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getDeviceVolume');
    }

    public getFreeSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getFreeSpace');
    }

    public getTotalSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getTotalSpace');
    }

    public isSimulator(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isSimulator');
    }

    public getSensorList(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this.getFullApiClassName(), 'getSensorList');
    }

    public getStatusBarHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getStatusBarHeight');
    }

    public getStatusBarWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getStatusBarWidth');
    }

    public isStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isStatusBarHidden');
    }

    public getDeviceMaxVolume(): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getDeviceMaxVolume');
    }

    public registerVolumeChangeListener(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'registerVolumeChangeListener');
    }

    public unregisterVolumeChangeListener(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'unregisterVolumeChangeListener');
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
