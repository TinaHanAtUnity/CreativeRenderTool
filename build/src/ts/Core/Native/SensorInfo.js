import { Platform } from 'Core/Constants/Platform';
import { AndroidSensorInfoApi } from 'Core/Native/Android/SensorInfo';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { IosSensorInfoApi } from 'Core/Native/iOS/SensorInfo';
export class SensorInfoApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
        if (nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosSensorInfoApi(nativeBridge);
        }
        else {
            this.Android = new AndroidSensorInfoApi(nativeBridge);
        }
    }
    stopAccelerometerUpdates() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'stopAccelerometerUpdates');
    }
    isAccelerometerActive() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isAccelerometerActive');
    }
    getAccelerometerData() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getAccelerometerData');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vuc29ySW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9TZW5zb3JJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBUTlELE1BQU0sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUl4QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzdDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqRDthQUFNO1lBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQztJQUVNLHdCQUF3QjtRQUMzQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFTSxxQkFBcUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRU0sb0JBQW9CO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQXFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7Q0FDSiJ9