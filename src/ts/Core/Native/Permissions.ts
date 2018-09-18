import { Platform } from 'Core/Constants/Platform';
import { AndroidPermissionsApi } from 'Core/Native/Android/AndroidPermissions';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IosPermissionsApi } from 'Core/Native/iOS/IosPermissions';
import { Observable2 } from 'Core/Utilities/Observable';
import { PermissionsUtil } from 'Core/Utilities/Permissions';

enum PermissionsEvent {
    PERMISSIONS_RESULT,
    PERMISSIONS_ERROR
}

export class PermissionsApi extends NativeApi {
    public permissionRequestCode: number = 1000;
    public onPermissionsResult = new Observable2<string, boolean>();

    public Android: AndroidPermissionsApi;
    public Ios: IosPermissionsApi;
    private readonly _currentPlatform: Platform;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
        const currentPlatform = nativeBridge.getPlatform();
        if (currentPlatform === Platform.ANDROID) {
            this.Android = new AndroidPermissionsApi(nativeBridge);
            this.Android.onPermissionsResult.subscribe(this.onAndroidPermissionsResult);
            this.Android.onPermissionsError.subscribe(this.onAndroidPermissionsError);
        } else if (currentPlatform === Platform.IOS) {
            this.Ios = new IosPermissionsApi(nativeBridge);
            this.Ios.onPermissionsResult.subscribe(this.onIosPermissionsResult);
        }
        this._currentPlatform = currentPlatform;
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

    private onAndroidPermissionsResult(requestCode: number, permissions: string[], results: number[]) {
        if (requestCode !== this.permissionRequestCode) {
            return;
        }
        const permission = PermissionsUtil.getCommonPermission(permissions[0]);
        const granted = results[0] !== -1;
        this.onPermissionsResult.trigger(permission, granted);
    }

    private onAndroidPermissionsError(error: string) {
        this.onPermissionsResult.trigger(error, false);
    }

    private onIosPermissionsResult(permission: string, granted: boolean) {
        const perm = PermissionsUtil.getCommonPermission(permission);
        this.onPermissionsResult.trigger(perm, granted);
    }
}
