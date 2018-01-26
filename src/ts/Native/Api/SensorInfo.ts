import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export interface IAccelerometerData {
    x: number;
    y: number;
    z: number;
}

export class SensorInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo');
    }

    public startAccelerometerUpdates(updateInterval: number): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'startAccelerometerUpdates', [updateInterval]);
    }

    public stopAccelerometerUpdates(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'stopAccelerometerUpdates');
    }

    public isAccelerometerActive(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isAccelerometerActive');
    }

    public getAccelerometerData(): Promise<IAccelerometerData> {
        return this._nativeBridge.invoke<IAccelerometerData>(this._apiClass, 'getAccelerometerData');
    }
}
