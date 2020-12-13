import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable1, Observable3 } from 'Core/Utilities/Observable';
var PermissionsEvent;
(function (PermissionsEvent) {
    PermissionsEvent[PermissionsEvent["PERMISSIONS_RESULT"] = 0] = "PERMISSIONS_RESULT";
    PermissionsEvent[PermissionsEvent["PERMISSIONS_ERROR"] = 1] = "PERMISSIONS_ERROR";
})(PermissionsEvent || (PermissionsEvent = {}));
export var AndroidPermissionsResult;
(function (AndroidPermissionsResult) {
    AndroidPermissionsResult[AndroidPermissionsResult["PERMISSION_DENIED"] = -1] = "PERMISSION_DENIED";
    AndroidPermissionsResult[AndroidPermissionsResult["PERMISSION_DENIED_APP_OP"] = -2] = "PERMISSION_DENIED_APP_OP";
    AndroidPermissionsResult[AndroidPermissionsResult["PERMISSION_GRANTED"] = 0] = "PERMISSION_GRANTED";
})(AndroidPermissionsResult || (AndroidPermissionsResult = {}));
export var AndroidPermission;
(function (AndroidPermission) {
    AndroidPermission["CAMERA"] = "android.permission.CAMERA";
    AndroidPermission["RECORD_AUDIO"] = "android.permission.RECORD_AUDIO";
    AndroidPermission["READ_PHONE_STATE"] = "android.permission.READ_PHONE_STATE";
    AndroidPermission["WRITE_EXTERNAL_STORAGE"] = "android.permission.WRITE_EXTERNAL_STORAGE";
})(AndroidPermission || (AndroidPermission = {}));
export class AndroidPermissionsApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
        this.onPermissionsResult = new Observable3();
        this.onPermissionsError = new Observable1();
    }
    getPermissions() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getPermissions');
    }
    checkPermission(permission) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'checkPermission', [permission]);
    }
    requestPermissions(permissions, requestCode) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'requestPermissions', [permissions, requestCode]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVybWlzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvQW5kcm9pZC9QZXJtaXNzaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFckUsSUFBSyxnQkFHSjtBQUhELFdBQUssZ0JBQWdCO0lBQ2pCLG1GQUFrQixDQUFBO0lBQ2xCLGlGQUFpQixDQUFBO0FBQ3JCLENBQUMsRUFISSxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBR3BCO0FBRUQsTUFBTSxDQUFOLElBQVksd0JBSVg7QUFKRCxXQUFZLHdCQUF3QjtJQUNoQyxrR0FBc0IsQ0FBQTtJQUN0QixnSEFBNkIsQ0FBQTtJQUM3QixtR0FBc0IsQ0FBQTtBQUMxQixDQUFDLEVBSlcsd0JBQXdCLEtBQXhCLHdCQUF3QixRQUluQztBQUVELE1BQU0sQ0FBTixJQUFZLGlCQUtYO0FBTEQsV0FBWSxpQkFBaUI7SUFDekIseURBQW9DLENBQUE7SUFDcEMscUVBQWdELENBQUE7SUFDaEQsNkVBQXdELENBQUE7SUFDeEQseUZBQW9FLENBQUE7QUFDeEUsQ0FBQyxFQUxXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFLNUI7QUFFRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsU0FBUztJQUloRCxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUp4Qyx3QkFBbUIsR0FBRyxJQUFJLFdBQVcsRUFBOEIsQ0FBQztRQUNwRSx1QkFBa0IsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO0lBSS9ELENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVNLGVBQWUsQ0FBQyxVQUFzQztRQUN6RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFTLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDdEcsQ0FBQztJQUVNLGtCQUFrQixDQUFDLFdBQTJDLEVBQUUsV0FBbUI7UUFDdEYsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNySCxDQUFDO0NBQ0oifQ==