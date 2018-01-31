import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Platform } from 'Constants/Platform';
import { AndroidSensorInfoApi } from 'Native/Api/AndroidSensorInfo';
import { IosSensorInfoApi } from 'Native/Api/IosSensorInfo';

export interface IAccelerometerData {
    x: number;
    y: number;
    z: number;
}

export class SensorInfoApi extends NativeApi {
    public Android: AndroidSensorInfoApi;
    public Ios: IosSensorInfoApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SensorInfo');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosSensorInfoApi(nativeBridge);
        } else {
            this.Android = new AndroidSensorInfoApi(nativeBridge);
        }
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
