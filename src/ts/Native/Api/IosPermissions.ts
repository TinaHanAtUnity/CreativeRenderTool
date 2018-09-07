import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable2 } from 'Utilities/Observable';

export enum IosPermission {
    AVMediaTypeVideo = 'vide',
    AVMediaTypeAudio = 'soun'
}

enum BundleKeys {
    Camera = 'NSCameraUsageDescription',
    Audio = 'NSMicrophoneUsageDescription'
}

export class IosPermissionsApi extends NativeApi {
    public readonly onPermissionsResult = new Observable2<string, boolean>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.CORE);
    }

    public checkPermissionsInManifest(permission: IosPermission | string): Promise<boolean> {
        let key = '';
        if (permission === IosPermission.AVMediaTypeVideo) {
            key = BundleKeys.Camera;
        } else if (permission === IosPermission.AVMediaTypeAudio) {
            key = BundleKeys.Audio;
        }
        this._nativeBridge.Sdk.logDebug('~~~key: ' + key);
        return new Promise<boolean>((resolve) => {
            this._nativeBridge.MainBundle.getDataForKey(key)
                .then((value: string | any) => {
                    this._nativeBridge.Sdk.logDebug('~~~value: ' + value);
                    resolve(value !== '');
                })
                .catch((err) => {
                    this._nativeBridge.Sdk.logDebug('~~~err: ' + err);
                    resolve(false);
                });
        });
    }

    public checkPermission(permission: IosPermission | string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'checkPermission', [permission]);
    }

    public requestPermission(permission: IosPermission | string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'requestPermission', [permission]);
    }
}
