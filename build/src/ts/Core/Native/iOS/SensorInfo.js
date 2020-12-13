import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class IosSensorInfoApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
    }
    startAccelerometerUpdates(delay) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'startAccelerometerUpdates', [delay]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vuc29ySW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9pT1MvU2Vuc29ySW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSXJFLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxTQUFTO0lBQzNDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTSx5QkFBeUIsQ0FBQyxLQUFhO1FBQzFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLDJCQUEyQixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1RyxDQUFDO0NBQ0oifQ==