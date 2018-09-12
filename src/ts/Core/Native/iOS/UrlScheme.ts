import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class UrlSchemeApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'UrlScheme', ApiPackage.CORE);
    }

    public open(url: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'open', [url]);
    }
}
