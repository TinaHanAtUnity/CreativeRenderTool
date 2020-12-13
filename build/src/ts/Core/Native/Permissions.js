import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { AndroidPermissionsApi } from 'Core/Native/Android/Permissions';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { IosPermissionsApi } from 'Core/Native/iOS/Permissions';
import { Observable2 } from 'Core/Utilities/Observable';
import { PermissionsUtil } from 'Core/Utilities/Permissions';
var PermissionsEvent;
(function (PermissionsEvent) {
    PermissionsEvent[PermissionsEvent["PERMISSIONS_RESULT"] = 0] = "PERMISSIONS_RESULT";
    PermissionsEvent[PermissionsEvent["PERMISSIONS_ERROR"] = 1] = "PERMISSIONS_ERROR";
})(PermissionsEvent || (PermissionsEvent = {}));
export class PermissionsApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE, EventCategory.PERMISSIONS);
        this.permissionRequestCode = 1000;
        this.onPermissionsResult = new Observable2();
        const currentPlatform = nativeBridge.getPlatform();
        if (currentPlatform === Platform.ANDROID) {
            this.Android = new AndroidPermissionsApi(nativeBridge);
            this.Android.onPermissionsResult.subscribe(this.onAndroidPermissionsResult);
            this.Android.onPermissionsError.subscribe(this.onAndroidPermissionsError);
        }
        else if (currentPlatform === Platform.IOS) {
            this.Ios = new IosPermissionsApi(nativeBridge);
            this.Ios.onPermissionsResult.subscribe(this.onIosPermissionsResult);
        }
        this._currentPlatform = currentPlatform;
    }
    handleEvent(event, parameters) {
        switch (event) {
            case PermissionsEvent[PermissionsEvent.PERMISSIONS_RESULT]:
                if (this._currentPlatform === Platform.ANDROID) {
                    this.onAndroidPermissionsResult(parameters[0], parameters[1], parameters[2]);
                }
                else {
                    this.onIosPermissionsResult(parameters[0], parameters[1]);
                }
                break;
            // Only Android has the error event.
            case PermissionsEvent[PermissionsEvent.PERMISSIONS_ERROR]:
                this.onAndroidPermissionsError('ERROR');
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
    onAndroidPermissionsResult(requestCode, permissions, results) {
        if (requestCode !== this.permissionRequestCode) {
            return;
        }
        const permission = PermissionsUtil.getCommonPermission(permissions[0]);
        const granted = results[0] !== -1;
        this.onPermissionsResult.trigger(permission, granted);
    }
    onAndroidPermissionsError(error) {
        this.onPermissionsResult.trigger(error, false);
    }
    onIosPermissionsResult(permission, granted) {
        const perm = PermissionsUtil.getCommonPermission(permission);
        this.onPermissionsResult.trigger(perm, granted);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVybWlzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvUGVybWlzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFN0QsSUFBSyxnQkFHSjtBQUhELFdBQUssZ0JBQWdCO0lBQ2pCLG1GQUFrQixDQUFBO0lBQ2xCLGlGQUFpQixDQUFBO0FBQ3JCLENBQUMsRUFISSxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBR3BCO0FBRUQsTUFBTSxPQUFPLGNBQWUsU0FBUSxTQUFTO0lBUXpDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFSNUUsMEJBQXFCLEdBQVcsSUFBSSxDQUFDO1FBQ3JDLHdCQUFtQixHQUFHLElBQUksV0FBVyxFQUFtQixDQUFDO1FBUTVELE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuRCxJQUFJLGVBQWUsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLENBQUMs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