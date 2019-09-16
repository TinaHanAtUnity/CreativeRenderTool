import { EventCategory } from 'Core/Constants/EventCategory';
import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DeviceInfoEvent } from 'Core/Native/DeviceInfoEvent';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';

export class IosDeviceInfoApi extends NativeApi {
    public readonly onVolumeChanged = new Observable2<number, number>();
    public readonly onMuteChanged = new Observable1<boolean>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE, EventCategory.DEVICEINFO);
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

    public checkIsMuted(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'checkIsMuted');
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

    public handleEvent(event: string, parameters: unknown[]): void {
        switch (event) {
            case DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED]:
                this.onVolumeChanged.trigger(<number>parameters[0], <number>parameters[1]);
                break;
            case DeviceInfoEvent[DeviceInfoEvent.IOS_MUTE_STATE_RECEIVED]:
                this.onMuteChanged.trigger(<boolean>parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
