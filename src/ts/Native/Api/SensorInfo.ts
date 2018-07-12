import { NativeBridge } from 'Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Native/NativeApi';
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
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosSensorInfoApi(nativeBridge);
        } else {
            this.Android = new AndroidSensorInfoApi(nativeBridge);
        }
    }

    public stopAccelerometerUpdates(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'stopAccelerometerUpdates');
    }

    public isAccelerometerActive(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'isAccelerometerActive');
    }

    public getAccelerometerData(): Promise<IAccelerometerData> {
        return this._nativeBridge.invoke<IAccelerometerData>(this.getFullApiClassName(), 'getAccelerometerData');
    }
}
