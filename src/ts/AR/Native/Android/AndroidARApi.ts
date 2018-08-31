import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Observable1 } from 'Common/Utilities/Observable';

export class AndroidARApi extends NativeApi {
    public readonly onAndroidEnumsReceived = new Observable1<any>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR);
    }

    public isARSupported(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isARSupported');
    }

    public initAR(): Promise<void> {
        return this._nativeBridge.invoke<any>(this._fullApiClassName, 'getAndroidConfigEnums').then((enums) => {
            this.onAndroidEnumsReceived.trigger(enums);

            return Promise.resolve();
        });
    }

    public advanceFrame(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'advanceFrame');
    }
}
