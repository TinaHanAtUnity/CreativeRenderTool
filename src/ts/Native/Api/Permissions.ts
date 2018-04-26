import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidPermissionsApi } from 'Native/Api/AndroidPermissions';
import { Platform } from 'Constants/Platform';
import { IosPermissionsApi } from 'Native/Api/IosPermissions';

export class PermissionsApi extends NativeApi {
    public Android: AndroidPermissionsApi;
    public Ios: IosPermissionsApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions');

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            // TODO: uncomment when Android SDK has permission support
            // this.Android = new AndroidPermissionsApi(nativeBridge);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosPermissionsApi(nativeBridge);
        }
    }
}
