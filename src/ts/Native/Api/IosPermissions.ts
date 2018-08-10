import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable2 } from 'Utilities/Observable';

enum PermissionsEvent {
    PERMISSIONS_RESULT
}

export enum IosPermission {
    AVMediaTypeVideo = 'vide',
    AVMediaTypeAudio = 'soun'
}

export class IosPermissionsApi extends NativeApi {
    public readonly onPermissionsResult = new Observable2<string, boolean>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions');
    }

    public checkPermission(permission: IosPermission | string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'checkPermission', [permission]);
    }

    public requestPermission(permission: IosPermission | string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'requestPermission', [permission]);
    }
}
