import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class AndroidSensorInfoApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'SensorInfo', ApiPackage.CORE);
    }
    startAccelerometerUpdates(delay) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'startAccelerometerUpdates', [delay]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vuc29ySW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9BbmRyb2lkL1NlbnNvckluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUdyRSxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsU0FBUztJQUMvQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0seUJBQXlCLENBQUMsS0FBa0I7UUFDL0MsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzVHLENBQUM7Q0FDSiJ9