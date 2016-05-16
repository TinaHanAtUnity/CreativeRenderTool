import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export class UrlSchemeApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'UrlScheme');
    }

    public open(url: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'open');
    }
}