import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0, Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';

enum StoreEvent {
    INITIALIZED,
    BILLING_START,
    BILLING_END,
    BILLING_START_ERROR,
    BILLING_END_ERROR,
    PURCHASE_HISTORY_RESULT,
    PURCHASE_HISTORY_ERROR,
    SKU_DETAILS_RESULT,
    SKU_DETAILS_ERROR,
    BILLING_SUPPORTED_RESULT,
    BILLING_SUPPORTED_ERROR
}

export enum AndroidStoreError {
    NOT_INITIALIZED,
    CLASS_NOT_FOUND,
    NO_SUCH_METHOD,
    INVOCATION_TARGET,
    ILLEGAL_ACCESS,
    JSON_ERROR,
    STORE_ERROR,
    UNKNOWN_ERROR
}


export class AndroidStoreApi extends NativeApi {

    public readonly onInitialized = new Observable0();
    public readonly onBillingSupportedResult = new Observable2<number, number>();
    public readonly onBillingSupportedError = new Observable3<number, AndroidStoreError, string>();
    public readonly onPurchaseHistoryResult = new Observable2<number, any>(); // todo: better typing?
    public readonly onPurchaseHistoryError = new Observable3<number, AndroidStoreError, string>();
    public readonly onSkuDetailsResult = new Observable2<number, any>(); // todo: better typing?
    public readonly onSkuDetailsError = new Observable3<number, AndroidStoreError, string>();
    public readonly onBillingStart = new Observable1<any>();
    public readonly onBillingStartError = new Observable2<AndroidStoreError, string>();
    public readonly onBillingEnd = new Observable1<any>();
    public readonly onBillingEndError = new Observable2<AndroidStoreError, string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Store', ApiPackage.STORE, EventCategory.STORE);
    }

    public initialize(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'initialize');
    }

    public setListenerState(state: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setListenerState', [state]);
    }

    public isBillingSupported(operationId: number, purchaseType: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'isBillingSupported', [operationId, purchaseType]);
    }

    public getPurchases(purchaseType: string): Promise<any> { // todo: better typing?
        return this._nativeBridge.invoke<any>(this._fullApiClassName, 'getPurchases', [purchaseType]);
    }

    public getPurchaseHistory(operationId: number, purchaseType: string, maxPurchases: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getPurchaseHistory', [operationId, purchaseType, maxPurchases]);
    }

    public getSkuDetails(operationId: number, purchaseType: string, skuList: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getSkuDetails', [operationId, purchaseType, skuList]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case StoreEvent[StoreEvent.BILLING_START]:
                this.onBillingStart.trigger(parameters[0]);
                break;

            case StoreEvent[StoreEvent.BILLING_END]:
                this.onBillingEnd.trigger(parameters[0]);
                break;

            // todo: other event types

            default:
                super.handleEvent(event, parameters);
        }
    }
}
