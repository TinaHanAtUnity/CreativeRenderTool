import { NativeApi, ApiPackage } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { Observable1 } from 'Utilities/Observable';

export class AndroidARApi extends NativeApi {
    public readonly onAndroidEnumsReceived = new Observable1<any>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR);
    }

    public isARSupported(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isARSupported');
    }

    public initAR(): Promise<void> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.invoke<any>(this._fullApiClassName, 'getAndroidConfigEnums').then((enums) => {
                this.onAndroidEnumsReceived.trigger(enums);

                return Promise.resolve();
            });
        }

        return Promise.resolve();
    }
}
