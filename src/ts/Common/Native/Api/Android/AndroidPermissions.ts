import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Observable1, Observable3 } from 'Core/Utilities/Observable';

export enum AndroidPermission {
    CAMERA = 'android.permission.CAMERA',
    RECORD_AUDIO = 'android.permission.RECORD_AUDIO'
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
