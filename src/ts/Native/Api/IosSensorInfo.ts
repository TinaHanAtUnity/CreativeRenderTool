import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Double } from 'Utilities/Double';

export class IosSensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo');
    }

    public startAccelerometerUpdates(delay: Double): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'startAccelerometerUpdates', [delay]);
    }
}
