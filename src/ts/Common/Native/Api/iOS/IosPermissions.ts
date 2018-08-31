import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Observable2 } from 'Core/Utilities/Observable';

export enum IosPermission {
    AVMediaTypeVideo = 'vide',
    AVMediaTypeAudio = 'soun'
}

export class IosPermissionsApi extends NativeApi {
    public readonly onPermissionsResult = new Observable2<string, boolean>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
    }

    public checkPermission(permission: IosPermission | string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'checkPermission', [permission]);
    }

    public requestPermission(permission: IosPermission | string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'requestPermission', [permission]);
    }
}
