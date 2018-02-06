import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { SensorDelay } from 'Constants/Android/SensorDelay';

export class AndroidSensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo');
    }

    public startAccelerometerUpdates(delay: SensorDelay): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'startAccelerometerUpdates', [delay]);
    }
}
