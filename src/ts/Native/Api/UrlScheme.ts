import { NativeBridge } from 'Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Native/NativeApi';

export class UrlSchemeApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'UrlScheme', ApiPackage.CORE);
    }

    public open(url: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'open', [url]);
    }
}
