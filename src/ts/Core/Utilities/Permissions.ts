import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/Core';
import { AndroidPermission } from 'Core/Native/Android/Permissions';
import { IosPermission } from 'Core/Native/iOS/Permissions';

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

    public static checkPermissions(core: Core, permission: PermissionTypes): Promise<CurrentPermission> {
        const platform = core.NativeBridge.getPlatform();
        if (platform === Platform.ANDROID) {
            return PermissionsUtil.checkAndroidPermission(core, permission);
        } else if (platform === Platform.IOS) {
            return PermissionsUtil.checkIosPermission(core, permission);
        }

        return Promise.resolve<CurrentPermission>(CurrentPermission.DENIED);
    }

    public static requestPermission(core: Core, permission: PermissionTypes): Promise<void> {
        const platformPermission = PermissionsUtil.getPlatformPermission(core.NativeBridge.getPlatform(), permission);
        if (platformPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        const platform = core.NativeBridge.getPlatform();
        if (platform === Platform.ANDROID) {
            core.Api.Permissions.permissionRequestCode += 1;
            return core.Api.Android!.Preferences.setBoolean(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString(), true).then(() => {
                return core.Api.Android!.Permissions.requestPermissions([platformPermission], core.Api.Permissions.permissionRequestCode);
            });
        } else if (platform === Platform.IOS) {
            return core.Api.iOS!.Permissions.requestPermission(platformPermission);
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

    private static checkAndroidPermission(core: Core, permission: PermissionTypes): Promise<CurrentPermission> {
        const androidPermission = PermissionsUtil.getPlatformPermission(Platform.ANDROID, permission);
        if (androidPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return new Promise<CurrentPermission>(resolve => {
            core.Api.Android!.Permissions.checkPermission(androidPermission).then(results => {
                if (results === 0) { // Granted = 0
                    resolve(CurrentPermission.ACCEPTED);
                    return;
                }

                // Emulate the behaviour on iOS because Android doesn't have an unknown state. We return UNKNOWN if we
                // haven't asked for the permission already.
                core.Api.Android!.Preferences.hasKey(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString()).then(asked => {
                    if (asked) {
                        resolve(CurrentPermission.DENIED);
                    } else {
                        resolve(CurrentPermission.UNKNOWN);
                    }
                });
            }).catch(() => {
                // If there are any errors, default to unknown
                resolve(CurrentPermission.UNKNOWN);
            });
        });
    }

    private static checkIosPermission(core: Core, permission: PermissionTypes): Promise<CurrentPermission> {
        const iosPermission = PermissionsUtil.getPlatformPermission(Platform.IOS, permission);
        if (iosPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return core.Api.iOS!.Permissions.checkPermission(iosPermission).then((results: number) => {
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
