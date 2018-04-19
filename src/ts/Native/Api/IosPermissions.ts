import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable2 } from 'Utilities/Observable';

enum PermissionsEvent {
    PERMISSIONS_RESULT,
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

    public checkPermission(permission: IosPermission): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'checkPermission', [permission]);
    }

    public requestPermission(permission: IosPermission): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'requestPermission', [permission]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch (event) {
            case PermissionsEvent[PermissionsEvent.PERMISSIONS_RESULT]:
                this.onPermissionsResult.trigger(parameters[0], parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
