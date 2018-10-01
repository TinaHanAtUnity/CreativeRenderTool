import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class MainBundleApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'MainBundle', ApiPackage.AR);
    }

    public getDataForKeysContaining(containsString: string): Promise<{ [key: string]: unknown }> {
        return this._nativeBridge.invoke<{ [key: string]: unknown }>(this._fullApiClassName, 'getDataForKeysContaining', [containsString]);
    }

    public getDataForKey(key: string): Promise<[string, unknown]> {
        return this._nativeBridge.invoke<[string, unknown]>(this._fullApiClassName, 'getDataForKey', [key]);
    }
}
