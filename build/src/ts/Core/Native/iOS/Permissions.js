import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable2 } from 'Core/Utilities/Observable';
export var IosPermission;
(function (IosPermission) {
    IosPermission["AVMediaTypeVideo"] = "vide";
    IosPermission["AVMediaTypeAudio"] = "soun";
})(IosPermission || (IosPermission = {}));
export var IosBundleKeys;
(function (IosBundleKeys) {
    IosBundleKeys["Camera"] = "NSCameraUsageDescription";
    IosBundleKeys["Audio"] = "NSMicrophoneUsageDescription";
})(IosBundleKeys || (IosBundleKeys = {}));
export class IosPermissionsApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
        this.onPermissionsResult = new Observable2();
    }
    checkPermission(permission) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'checkPermission', [permission]);
    }
    requestPermission(permission) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'requestPermission', [permission]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVybWlzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvaU9TL1Blcm1pc3Npb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE1BQU0sQ0FBTixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDckIsMENBQXlCLENBQUE7SUFDekIsMENBQXlCLENBQUE7QUFDN0IsQ0FBQyxFQUhXLGFBQWEsS0FBYixhQUFhLFFBR3hCO0FBRUQsTUFBTSxDQUFOLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUNyQixvREFBbUMsQ0FBQTtJQUNuQyx1REFBc0MsQ0FBQTtBQUMxQyxDQUFDLEVBSFcsYUFBYSxLQUFiLGFBQWEsUUFHeEI7QUFFRCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsU0FBUztJQUc1QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUh4Qyx3QkFBbUIsR0FBRyxJQUFJLFdBQVcsRUFBbUIsQ0FBQztJQUl6RSxDQUFDO0lBRU0sZUFBZSxDQUFDLFVBQWtDO1FBQ3JELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRU0saUJBQWlCLENBQUMsVUFBa0M7UUFDdkQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3RHLENBQUM7Q0FDSiJ9