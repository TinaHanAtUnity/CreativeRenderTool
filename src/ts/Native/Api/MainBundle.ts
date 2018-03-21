import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class MainBundle extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'MainBundle');
    }

    public getDataForKeysContaining(containsString: string): Promise<{ [key: string]: any }> {
        return this._nativeBridge.invoke<{ [key: string]: any }>(this._apiClass, 'getDataForKeysContaining', [containsString]);
    }

    public getDataForKey(key: string): Promise<[string, any]> {
        return this._nativeBridge.invoke<[string, any]>(this._apiClass, 'getDataForKey', [key]);
    }
}
