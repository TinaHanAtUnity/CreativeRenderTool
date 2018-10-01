import {Platform} from 'Core/Constants/Platform';
import {NativeBridge} from 'Core/Native/Bridge/NativeBridge';
import {AndroidPermission} from 'Core/Native/Android/AndroidPermissions';
import {IosPermission} from 'Core/Native/iOS/IosPermissions';

export enum CurrentPermission {
    UNKNOWN,
    DENIED,
    ACCEPTED
}

export enum PermissionTypes {
    CAMERA = 'camera',
    AUDIO = 'audio',
    INVALID = 'invalid'
}

export class PermissionsUtil {
    private static readonly ANDROID_PERMISSIONS_ASKED_KEY = 'unity-ads-permissions-asked';

    public static checkPermissions(nativeBridge: NativeBridge, permission: PermissionTypes): Promise<CurrentPermission> {
        const platform = nativeBridge.getPlatform();
        if (platform === Platform.ANDROID) {
            return PermissionsUtil.checkAndroidPermission(nativeBridge, permission);
        } else if (platform === Platform.IOS) {
            return PermissionsUtil.checkIosPermission(nativeBridge, permission);
        }

        return Promise.resolve<CurrentPermission>(CurrentPermission.DENIED);
    }

    public static requestPermission(nativeBridge: NativeBridge, permission: PermissionTypes): Promise<void> {
        const platformPermission = PermissionsUtil.getPlatformPermission(nativeBridge.getPlatform(), permission);
        if (platformPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        const platform = nativeBridge.getPlatform();
        if (platform === Platform.ANDROID) {
            nativeBridge.Permissions.permissionRequestCode += 1;
            return nativeBridge.AndroidPreferences.setBoolean(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString(), true).then(() => {
                return nativeBridge.Permissions.Android.requestPermissions([platformPermission], nativeBridge.Permissions.permissionRequestCode);
            });
        } else if (platform === Platform.IOS) {
            return nativeBridge.Permissions.Ios.requestPermission(platformPermission);
        }

        return Promise.resolve();
    }

    public static getCommonPermission(permission: IosPermission | AndroidPermission | string): PermissionTypes {
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
        return PermissionTypes.INVALID;
    }

    private static checkAndroidPermission(nativeBridge: NativeBridge, permission: PermissionTypes): Promise<CurrentPermission> {
        const androidPermission = PermissionsUtil.getPlatformPermission(Platform.ANDROID, permission);
        if (androidPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return new Promise<CurrentPermission>(resolve => {
            nativeBridge.Permissions.Android.checkPermission(androidPermission).then(results => {
                if (results === 0) { // Granted = 0
                    resolve(CurrentPermission.ACCEPTED);
                    return;
                }

                // Emulate the behaviour on iOS because Android doesn't have an unknown state. We return UNKNOWN if we
                // haven't asked for the permission already.
                nativeBridge.AndroidPreferences.hasKey(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString()).then(asked => {
                    if (asked) {
                        resolve(CurrentPermission.DENIED);
                    } else {
                        resolve(CurrentPermission.UNKNOWN);
                    }
                });
            }).catch(() => {
                // If there are unknown errors, default to unknown
                resolve(CurrentPermission.UNKNOWN);
            });
        });
    }

    private static checkIosPermission(nativeBridge: NativeBridge, permission: PermissionTypes): Promise<CurrentPermission> {
        const iosPermission = PermissionsUtil.getPlatformPermission(Platform.IOS, permission);
        if (iosPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return nativeBridge.Permissions.Ios.checkPermission(iosPermission).then((results: number) => {
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

    private static getPlatformPermission(platform: Platform, permission: PermissionTypes): string {
        const isAndroid = platform === Platform.ANDROID;
        if (permission === PermissionTypes.CAMERA) {
            return isAndroid ? AndroidPermission.CAMERA : IosPermission.AVMediaTypeVideo;
        }
        if (permission === PermissionTypes.AUDIO) {
            return isAndroid ? AndroidPermission.RECORD_AUDIO : IosPermission.AVMediaTypeAudio;
        }
        // not supported
        return PermissionTypes.INVALID;
    }
}
