import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';

enum IosStoreEvent {
    PRODUCT_REQUEST_COMPLETE,
    PRODUCT_REQUEST_ERROR_NO_PRODUCTS,
    RECEIVED_TRANSACTION
}

export class IosStoreApi extends NativeApi {
    public readonly onProductRequestErrorNoProducts = new Observable1<number>();
    public readonly onProductRequestComplete = new Observable2<number, unknown>(); // todo: typing
    public readonly onTransaction = new Observable1<unknown>(); // todo: typing

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Store', ApiPackage.STORE, EventCategory.STORE);
    }

    public requestProductInfos(productIds: string[], requestId: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'requestProductInfos', [productIds, requestId]);
    }

    public startTransactionObserver(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'startTransactionObserver');
    }

    public stopTransactionObserver(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'stopTransactionObserver');
    }

    public getReceipt(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getReceipt');
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case IosStoreEvent[IosStoreEvent.PRODUCT_REQUEST_COMPLETE]:
                this.onProductRequestComplete.trigger(<number>parameters[0], parameters[1]);
                break;

            case IosStoreEvent[IosStoreEvent.PRODUCT_REQUEST_ERROR_NO_PRODUCTS]:
                this.onProductRequestErrorNoProducts.trigger(<number>parameters[0]);
                break;

            case IosStoreEvent[IosStoreEvent.RECEIVED_TRANSACTION]:
                this.onTransaction.trigger(parameters[0]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
