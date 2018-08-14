import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidPermissionsApi } from 'Native/Api/AndroidPermissions';
import { Platform } from 'Constants/Platform';
import { IosPermissionsApi } from 'Native/Api/IosPermissions';

export class PermissionsApi extends NativeApi {
    public Android: AndroidPermissionsApi;
    public Ios: IosPermissionsApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Permissions', ApiPackage.AR);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidPermissionsApi(nativeBridge);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosPermissionsApi(nativeBridge);
        }
    }
}
