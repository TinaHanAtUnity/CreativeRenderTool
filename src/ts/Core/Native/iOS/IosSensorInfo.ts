import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Double } from 'Core/Utilities/Double';

export class IosSensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
    }

    public startAccelerometerUpdates(delay: Double): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'startAccelerometerUpdates', [delay]);
    }
}
