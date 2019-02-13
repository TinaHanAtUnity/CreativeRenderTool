import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1, Observable3 } from 'Core/Utilities/Observable';

enum PermissionsEvent {
    PERMISSIONS_RESULT,
    PERMISSIONS_ERROR
}

export enum AndroidPermissionsResult {
    PERMISSION_DENIED = -1,
    PERMISSION_DENIED_APP_OP = -2,
    PERMISSION_GRANTED = 0
}

export enum AndroidPermission {
    CAMERA = 'android.permission.CAMERA',
    RECORD_AUDIO = 'android.permission.RECORD_AUDIO',
    READ_PHONE_STATE = 'android.permission.READ_PHONE_STATE',
    WRITE_EXTERNAL_STORAGE = 'android.permission.WRITE_EXTERNAL_STORAGE'
}

export class AndroidPermissionsApi extends NativeApi {
    public readonly onPermissionsResult = new Observable3<number, string[], number[]>();
    public readonly onPermissionsError = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
    }

    public getPermissions(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._fullApiClassName, 'getPermissions');
    }

    public checkPermission(permission: AndroidPermission | string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'checkPermission', [permission]);
    }

    public requestPermissions(permissions: AndroidPermission[] | string[], requestCode: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'requestPermissions', [permissions, requestCode]);
    }
}
