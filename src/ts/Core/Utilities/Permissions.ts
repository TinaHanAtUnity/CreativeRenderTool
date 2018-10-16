import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/Core';
import { AndroidPermission } from 'Core/Native/Android/Permissions';
import { IosBundleKeys, IosPermission } from 'Core/Native/iOS/Permissions';

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

    public static checkPermissionInManifest(platform: Platform, core: ICoreApi, permission: PermissionTypes): Promise<boolean> {
        const platformPermission = PermissionsUtil.getPlatformPermission(platform, permission);
        if (platform === Platform.ANDROID) {
            return PermissionsUtil.checkAndroidPermissionInManifest(core, platformPermission);
        } else {
            return PermissionsUtil.checkIosPermissionInManifest(core, platformPermission);
        }
        return Promise.resolve(false);
    }

    public static checkPermissions(platform: Platform, core: ICoreApi, permission: PermissionTypes): Promise<CurrentPermission> {
        if (platform === Platform.ANDROID) {
            return PermissionsUtil.checkAndroidPermission(core, permission);
        } else if (platform === Platform.IOS) {
            return PermissionsUtil.checkIosPermission(core, permission);
        }

        return Promise.resolve<CurrentPermission>(CurrentPermission.DENIED);
    }

    public static requestPermission(platform: Platform, core: ICoreApi, permission: PermissionTypes): Promise<void> {
        const platformPermission = PermissionsUtil.getPlatformPermission(platform, permission);
        if (platformPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        if (platform === Platform.ANDROID) {
            core.Permissions.permissionRequestCode += 1;
            return core.Android!.Preferences.setBoolean(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString(), true).then(() => {
                return core.Permissions.Android!.requestPermissions([platformPermission], core.Permissions.permissionRequestCode);
            });
        } else if (platform === Platform.IOS) {
            return core.Permissions.Ios!.requestPermission(platformPermission);
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

    private static checkAndroidPermissionInManifest(core: ICoreApi, permission: string): Promise<boolean> {
        return core.Permissions.Android!.getPermissions()
            .then((permissions: string[]) => permissions.some((key: string) => key === permission))
            .catch(() => false);
    }

    private static checkIosPermissionInManifest(core: ICoreApi, permission: string): Promise<boolean> {
        let key = '';
        if (permission === IosPermission.AVMediaTypeVideo) {
            key = IosBundleKeys.Camera;
        } else if (permission === IosPermission.AVMediaTypeAudio) {
            key = IosBundleKeys.Audio;
        } else {
            return Promise.resolve(false);
        }
        return core.iOS!.MainBundle.getDataForKey(key)
            .then((value: [string, any]) => value[0] !== '')
            .catch(() => false);
    }

    private static checkAndroidPermission(core: ICoreApi, permission: PermissionTypes): Promise<CurrentPermission> {
        const androidPermission = PermissionsUtil.getPlatformPermission(Platform.ANDROID, permission);
        if (androidPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return new Promise<CurrentPermission>(resolve => {
            core.Permissions.Android!.checkPermission(androidPermission).then(results => {
                if (results === 0) { // Granted = 0
                    resolve(CurrentPermission.ACCEPTED);
                    return;
                }

                // Emulate the behaviour on iOS because Android doesn't have an unknown state. We return UNKNOWN if we
                // haven't asked for the permission already.
                core.Android!.Preferences.hasKey(PermissionsUtil.ANDROID_PERMISSIONS_ASKED_KEY, permission.toString()).then(asked => {
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

    private static checkIosPermission(core: ICoreApi, permission: PermissionTypes): Promise<CurrentPermission> {
        const iosPermission = PermissionsUtil.getPlatformPermission(Platform.IOS, permission);
        if (iosPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return core.Permissions.Ios!.checkPermission(iosPermission).then((results: number) => {
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
