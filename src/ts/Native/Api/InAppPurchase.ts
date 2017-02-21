import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export class InAppPurchaseApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'InAppPurchase');
    }

    public getAppStoreReciept(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAppStoreReciept');
    }

    public getAppStoreRecieptURL(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAppStoreRecieptURL');
    }

}
