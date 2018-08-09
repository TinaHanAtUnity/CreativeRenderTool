import { NativeBridge } from 'Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { Double } from 'Utilities/Double';

export class IosSensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
    }

    public startAccelerometerUpdates(delay: Double): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'startAccelerometerUpdates', [delay]);
    }
}
