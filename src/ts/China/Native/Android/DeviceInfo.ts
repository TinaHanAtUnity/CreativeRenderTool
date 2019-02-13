import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class ChinaAndroidDeviceInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CHINA, EventCategory.DEVICEINFO);
    }

    public getDeviceIdWithSlot(slotIndex: number): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getDeviceIdWithSlot', [slotIndex]);
    }

    public getDeviceId(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getDeviceId');
    }
}
