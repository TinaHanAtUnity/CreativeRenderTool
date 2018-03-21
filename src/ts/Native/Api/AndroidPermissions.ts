import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable1, Observable3 } from 'Utilities/Observable';

enum PermissionsEvent {
    PERMISSIONS_RESULT,
    PERMISSIONS_ERROR
}

export class AndroidPermissionsApi extends NativeApi {
    public readonly onPermissionsResult = new Observable3<number, string[], number[]>();
    public readonly onPermissionsError = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions');
    }

    public getPermissions(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getPermissions');
    }

    public checkPermission(permission: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'checkPermission', [permission]);
    }

    public requestPermissions(permissions: string[], requestCode: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'requestPermissions', [permissions, requestCode]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch (event) {
            case PermissionsEvent[PermissionsEvent.PERMISSIONS_RESULT]:
                this.onPermissionsResult.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case PermissionsEvent[PermissionsEvent.PERMISSIONS_ERROR]:
                this.onPermissionsError.trigger(parameters[0]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
