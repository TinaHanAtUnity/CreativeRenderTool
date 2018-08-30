import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class MainBundleApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'MainBundle', ApiPackage.AR);
    }

    public getDataForKeysContaining(containsString: string): Promise<{ [key: string]: any }> {
        return this._nativeBridge.invoke<{ [key: string]: any }>(this._fullApiClassName, 'getDataForKeysContaining', [containsString]);
    }

    public getDataForKey(key: string): Promise<[string, any]> {
        return this._nativeBridge.invoke<[string, any]>(this._fullApiClassName, 'getDataForKey', [key]);
    }
}
