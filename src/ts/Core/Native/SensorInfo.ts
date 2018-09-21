import { Platform } from 'Core/Constants/Platform';
import { AndroidSensorInfoApi } from 'Core/Native/Android/SensorInfo';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IosSensorInfoApi } from 'Core/Native/iOS/SensorInfo';

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
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'stopAccelerometerUpdates');
    }

    public isAccelerometerActive(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isAccelerometerActive');
    }

    public getAccelerometerData(): Promise<IAccelerometerData> {
        return this._nativeBridge.invoke<IAccelerometerData>(this._fullApiClassName, 'getAccelerometerData');
    }
}
