import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';

export abstract class AdUnit {
    protected _nativeBridge: NativeBridge;
    protected _deviceInfo: DeviceInfo;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
    }

    public abstract open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: any): Promise<void>;

    public abstract close(): Promise<void>;
}