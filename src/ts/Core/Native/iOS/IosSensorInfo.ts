import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';

export class IosSensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
    }

    public startAccelerometerUpdates(delay: Double): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'startAccelerometerUpdates', [delay]);
    }
}
