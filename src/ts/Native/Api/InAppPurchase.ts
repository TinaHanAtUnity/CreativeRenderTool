import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export class InAppPurchaseApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'InAppPurchase');
    }

    public getAppStoreReceipt(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAppStoreReceipt');
    }

    public getAppStoreReceiptURL(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getAppStoreReceiptURL');
    }

}
