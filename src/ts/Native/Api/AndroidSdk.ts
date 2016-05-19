import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export class AndroidSdkApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Sdk');
    }

    public disableWebViewAcceleration(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'disableWebViewAcceleration');
    }
}