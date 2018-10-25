import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable2 } from 'Core/Utilities/Observable';
import {EventCategory} from '../../Constants/EventCategory';

export enum IosPermission {
    AVMediaTypeVideo = 'vide',
    AVMediaTypeAudio = 'soun'
}

export enum IosBundleKeys {
    Camera = 'NSCameraUsageDescription',
    Audio = 'NSMicrophoneUsageDescription'
}

export class IosPermissionsApi extends NativeApi {
    public readonly onPermissionsResult = new Observable2<string, boolean>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE, EventCategory.PERMISSIONS);
    }

    public checkPermission(permission: IosPermission | string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'checkPermission', [permission]);
    }

    public requestPermission(permission: IosPermission | string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'requestPermission', [permission]);
    }
}
