import { UIUserInterfaceIdiom } from 'Common/Constants/iOS/UIUserInterfaceIdiom';
import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Observable2 } from 'Common/Utilities/Observable';
import { DeviceInfoEvent } from 'Core/Native/DeviceInfoEvent';

export class IosDeviceInfoApi extends NativeApi {
    public readonly onVolumeChanged = new Observable2<number, number>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE);
    }

    public getScreenScale(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getScreenScale');
    }

    public getUserInterfaceIdiom(): Promise<UIUserInterfaceIdiom> {
        return this._nativeBridge.invoke<UIUserInterfaceIdiom>(this._fullApiClassName, 'getUserInterfaceIdiom');
    }

    public getDeviceVolume(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getDeviceVolume');
    }

    public getFreeSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getFreeSpace');
    }

    public getTotalSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getTotalSpace');
    }

    public isSimulator(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isSimulator');
    }

    public getSensorList(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._fullApiClassName, 'getSensorList');
    }

    public getStatusBarHeight(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getStatusBarHeight');
    }

    public getStatusBarWidth(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getStatusBarWidth');
    }

    public isStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isStatusBarHidden');
    }

    public getDeviceMaxVolume(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getDeviceMaxVolume');
    }

    public registerVolumeChangeListener(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'registerVolumeChangeListener');
    }

    public unregisterVolumeChangeListener(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'unregisterVolumeChangeListener');
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
