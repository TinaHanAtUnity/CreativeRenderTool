import { NativeBridge } from 'Common/Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { SensorDelay } from 'Common/Constants/Android/SensorDelay';

export class AndroidSensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
    }

    public startAccelerometerUpdates(delay: SensorDelay): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'startAccelerometerUpdates', [delay]);
    }
}
