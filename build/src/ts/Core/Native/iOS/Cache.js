import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class IosCacheApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE);
    }
    getVideoInfo(fileId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getVideoInfo', [fileId]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvaU9TL0NhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHckUsTUFBTSxPQUFPLFdBQVksU0FBUSxTQUFTO0lBQ3RDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxZQUFZLENBQUMsTUFBYztRQUM5QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUEyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqSCxDQUFDO0NBQ0oifQ==