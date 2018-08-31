import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { Platform } from 'Common/Constants/Platform';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Observable2 } from 'Common/Utilities/Observable';
import { AndroidPermission, AndroidPermissionsApi } from 'Core/Native/Android/AndroidPermissions';
import { IosPermission, IosPermissionsApi } from 'Core/Native/iOS/IosPermissions';

enum PermissionsEvent {
    PERMISSIONS_RESULT,
    PERMISSIONS_ERROR
}

export enum PermissionTypes {
    CAMERA = 'camera',
    AUDIO = 'audio',
    INVALID = 'invalid'
}

export enum CurrentPermission {
    UNKNOWN,
    DENIED,
    ACCEPTED
}

export class PermissionsApi extends NativeApi {
    public permissionRequestCode: number = 1000;
    public onPermissionsResult = new Observable2<string, boolean>();

    private _android: AndroidPermissionsApi;
    private _ios: IosPermissionsApi;
    private _currentPlatform: Platform;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
        const currentPlatform = nativeBridge.getPlatform();
        if (currentPlatform === Platform.ANDROID) {
            this._android = new AndroidPermissionsApi(nativeBridge);
        } else if(currentPlatform === Platform.IOS) {
            this._ios = new IosPermissionsApi(nativeBridge);
        }
        this._currentPlatform = currentPlatform;
    }

    public checkPermissions(permission: PermissionTypes): Promise<CurrentPermission> {
        if (this._currentPlatform === Platform.ANDROID) {
            return this.checkAndroidPermission(permission);
        }
        return this.checkIosPermission(permission);
    }

    public requestPermission(permission: PermissionTypes): Promise<void> {
        const platformPermission = this.getPlatformPermission(permission);
        if (platformPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        if (this._currentPlatform === Platform.ANDROID) {
            this.permissionRequestCode += 1;
            // Subscribe for the results
            this._android.onPermissionsResult.subscribe(this.onAndroidPermissionsResult);
            this._android.onPermissionsError.subscribe(this.onAndroidPermissionsError);
            return this._android.requestPermissions([platformPermission], this.permissionRequestCode);
        }
        this._ios.onPermissionsResult.subscribe(this.onIosPermissionsResult);
        return this._ios.requestPermission(platformPermission);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch (event) {
            case PermissionsEvent[PermissionsEvent.PERMISSIONS_RESULT]:
                if (this._currentPlatform === Platform.ANDROID) {
                    this.onAndroidPermissionsResult(parameters[0], parameters[1], parameters[2]);
                } else {
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

    private getPlatformPermission(permission: PermissionTypes): string {
        const isAndroid = this._currentPlatform === Platform.ANDROID;
        if (permission === PermissionTypes.CAMERA) {
            return isAndroid ? AndroidPermission.CAMERA : IosPermission.AVMediaTypeVideo;
        }
        if (permission === PermissionTypes.AUDIO) {
            return isAndroid ? AndroidPermission.RECORD_AUDIO : IosPermission.AVMediaTypeAudio;
        }
        // not supported
        return PermissionTypes.INVALID;
    }

    private getCommonPermission(permission: IosPermission | AndroidPermission | string): PermissionTypes {
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

    private checkAndroidPermission(permission: PermissionTypes): Promise<CurrentPermission> {
        const androidPermission = this.getPlatformPermission(permission);
        if (androidPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return new Promise<CurrentPermission>(resolve => {
            this._android.checkPermission(androidPermission).then(results => {
                if (results === 0) { // Granted = 0
                    resolve(CurrentPermission.ACCEPTED);
                }
                // Denied = -1
                resolve(CurrentPermission.DENIED);
            }).catch(() => {
                // If there are any errors, default to unknown
                resolve(CurrentPermission.UNKNOWN);
            });
        });
    }

    private checkIosPermission(permission: PermissionTypes): Promise<CurrentPermission> {
        const iosPermission = this.getPlatformPermission(permission);
        if (iosPermission === PermissionTypes.INVALID) {
            return Promise.reject(PermissionTypes.INVALID);
        }

        return this._ios.checkPermission(iosPermission).then((results: number) => {
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

    private onAndroidPermissionsResult = (requestCode: number, permissions: string[], results: number[]): void => {
        if (requestCode !== this.permissionRequestCode) {
            return;
        }
        const permission = this.getCommonPermission(permissions[0]);
        const granted = results[0] === -1 ? false : true;
        this.onPermissionsResult.trigger(permission, granted);
    }

    private onAndroidPermissionsError = (error: string): void => {
        this.onPermissionsResult.trigger(error, false);
    }

    private onIosPermissionsResult = (permission: string, granted: boolean): void => {
        const perm = this.getCommonPermission(permission);
        this.onPermissionsResult.trigger(perm, granted);
    }
}
