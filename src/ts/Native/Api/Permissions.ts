import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidPermissionsApi } from 'Native/Api/AndroidPermissions';
import { Platform } from 'Constants/Platform';

export class PermissionsApi extends NativeApi {
    public Android: AndroidPermissionsApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions');

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidPermissionsApi(nativeBridge);
        }
    }
}
