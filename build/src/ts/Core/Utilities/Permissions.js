import { Platform } from 'Core/Constants/Platform';
import { AndroidPermission } from 'Core/Native/Android/Permissions';
import { IosBundleKeys, IosPermission } from 'Core/Native/iOS/Permissions';
export var CurrentPermission;
(function (CurrentPermission) {
    CurrentPermission[CurrentPermission["UNKNOWN"] = 0] = "UNKNOWN";
    CurrentPermission[CurrentPermission["DENIED"] = 1] = "DENIED";
    CurrentPermission[CurrentPermission["ACCEPTED"] = 2] = "ACCEPTED";
    CurrentPermission[CurrentPermission["NOT_IN_MANIFEST"] = 3] = "NOT_IN_MANIFEST";
})(CurrentPermission || (CurrentPermission = {}));
export var PermissionTypes;
(function (PermissionTypes) {
    PermissionTypes["CAMERA"] = "camera";
    PermissionTypes["AUDIO"] = "audio";
    PermissionTypes["WRITE_EXTERNAL_STORAGE"] = "write_external_storage";
    PermissionTypes["READ_PHONE_STATE"] = "read_phone_state";
    PermissionTypes["INVALID"] = "invalid";
})(PermissionTypes || (PermissionTypes = {}));
export class PermissionsUtil {
    static checkPermissionInManifest(platform, core, permission) {
        const platformPermission = PermissionsUtil.getPlatformPermission(platform, permission);
        if (platform === Platform.ANDROID) {
            return PermissionsUtil.checkAndroidPermissionInManifest(core, platformPermission);
        }
        else if (platform === Platform.IOS) {
            return PermissionsUtil.checkIosPermissionInManifest(core, platformPermission);
        }
        return Promise.resolve(false);
    }
    static checkPermissions(platform, core, permission) {
        if (platform === Platform.ANDROID) {
            return PermissionsUtil.checkAndroidPermission(core, permission);
        }
        else if (platform === Platform.IOS) {
            return PermissionsUtil.checkIosPermission(core, permission);
        }
        return Promise.resolve(CurrentPermission.DENIED);
    }
    static requestPermission(platform, core, permission) {
        const platformPermission = PermissionsUtil.getPlatformPermission(platform, permission);
        if (platformPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }
        if (platform === Platform.ANDROID) {
            core.Permissions.permissionRequestCode += 1;
            return core.Android.Preferences.setBoolean(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString(), true).then(() => {
                return core.Permissions.Android.requestPermissions([platformPermission], core.Permissions.permissionRequestCode);
            });
        }
        else if (platform === Platform.IOS) {
            return core.Permissions.Ios.requestPermission(platformPermission);
        }
        return Promise.resolve();
    }
    static getCommonPermission(permission) {
        if (permission === IosPermission.AVMediaTypeVideo) {
            return PermissionTypes.CAMERA;
        }
        if (permission === IosPermission.AVMediaTypeAudio) {
            return PermissionTypes.AUDIO;
        }
        if (permission === AndroidPermission.CAMERA) {
            return PermissionTypes.CAMERA;
        }
        if (permission === AndroidPermission.RECORD_AUDIO) {
            return PermissionTypes.AUDIO;
        }
        // only Android permissions
        if (permission === AndroidPermission.WRITE_EXTERNAL_STORAGE) {
            return PermissionTypes.WRITE_EXTERNAL_STORAGE;
        }
        if (permission === AndroidPermission.READ_PHONE_STATE) {
            return PermissionTypes.READ_PHONE_STATE;
        }
        return PermissionTypes.INVALID;
    }
    static checkAndroidPermissionInManifest(core, permission) {
        return core.Permissions.Android.getPermissions()
            .then((permissions) => permissions.some((key) => key === permission))
            .catch(() => false);
    }
    static checkIosPermissionInManifest(core, permission) {
        let key = '';
        if (permission === IosPermission.AVMediaTypeVideo) {
            key = IosBundleKeys.Camera;
        }
        else if (permission === IosPermission.AVMediaTypeAudio) {
            key = IosBundleKeys.Audio;
        }
        else {
            return Promise.resolve(false);
        }
        return core.iOS.MainBundle.getDataForKey(key)
            .then((value) => value[0] !== '')
            .catch(() => false);
    }
    static checkAndroidPermission(core, permission) {
        const androidPermission = PermissionsUtil.getPlatformPermission(Platform.ANDROID, permission);
        if (androidPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }
        return new Promise(resolve => {
            core.Permissions.Android.checkPermission(androidPermission).then(results => {
                if (results === 0) { // Granted = 0
                    resolve(CurrentPermission.ACCEPTED);
                    return;
                }
                // Emulate the behaviour on iOS because Android doesn't have an unknown state. We return UNKNOWN if we
                // haven't asked for the permission already.
                core.Android.Preferences.hasKey(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString()).then(asked => {
                    if (asked) {
                        resolve(CurrentPermission.DENIED);
                    }
                    else {
                        resolve(CurrentPermission.UNKNOWN);
                    }
                });
            }).catch(() => {
                // If there are any errors, default to unknown
                resolve(CurrentPermission.UNKNOWN);
            });
        });
    }
    static checkIosPermission(core, permission) {
        const iosPermission = PermissionsUtil.getPlatformPermission(Platform.IOS, permission);
        if (iosPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }
        return core.Permissions.Ios.checkPermission(iosPermission).then((results) => {
            if (results === 3) { // Authorized = 3
                return CurrentPermission.ACCEPTED;
            }
            if (results === 0) { // NotDetermined = 0
                return CurrentPermission.UNKNOWN;
            }
            // Restricted = 1, Denied = 2
            return CurrentPermission.DENIED;
        });
    }
    static getPlatformPermission(platform, permission) {
        const isAndroid = platform === Platform.ANDROID;
        if (permission === PermissionTypes.CAMERA) {
            return isAndroid ? AndroidPermission.CAMERA : IosPermission.AVMediaTypeVideo;
        }
        if (permission === PermissionTypes.AUDIO) {
            return isAndroid ? AndroidPermission.RECORD_AUDIO : IosPermission.AVMediaTypeAudio;
        }
        // only Android permissions
        if (permission === PermissionTypes.READ_PHONE_STATE) {
            return isAndroid ? AndroidPermission.READ_PHONE_STATE : PermissionTypes.INVALID;
        }
        if (permission === PermissionTypes.WRITE_EXTERNAL_STORAGE) {
            return isAndroid ? AndroidPermission.WRITE_EXTERNAL_STORAGE : PermissionTypes.INVALID;
        }
        // not supported
        return PermissionTypes.INVALID;
    }
}
PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY = 'unity-ads-permissions-asked';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVybWlzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvUGVybWlzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFM0UsTUFBTSxDQUFOLElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUN6QiwrREFBTyxDQUFBO0lBQ1AsNkRBQU0sQ0FBQTtJQUNOLGlFQUFRLENBQUE7SUFDUiwrRUFBZSxDQUFBO0FBQ25CLENBQUMsRUFMVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBSzVCO0FBRUQsTUFBTSxDQUFOLElBQVksZUFNWDtBQU5ELFdBQVksZUFBZTtJQUN2QixvQ0FBaUIsQ0FBQTtJQUNqQixrQ0FBZSxDQUFBO0lBQ2Ysb0VBQWlELENBQUE7SUFDakQsd0RBQXFDLENBQUE7SUFDckMsc0NBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQU5XLGVBQWUsS0FBZixlQUFlLFFBTTFCO0FBRUQsTUFBTSxPQUFPLGVBQWU7SUFHakIsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFFBQWtCLEVBQUUsSUFBYyxFQUFFLFVBQTJCO1FBQ25HLE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RixJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQy9CLE9BQU8sZUFBZSxDQUFDLGdDQUFnQyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3JGO2FBQU0sSUFBSSxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNsQyxPQUFP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