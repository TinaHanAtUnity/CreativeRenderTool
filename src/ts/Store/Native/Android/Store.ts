import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0, Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';

enum AndroidStoreEvent {
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

export interface IGooglePurchaseData {
    autorenewing?: boolean;
    orderId: string;
    packageName: string;
    productId: string;
    purchaseTime: number;
    purchaseState: number;
    developerPayload: string;
    purchaseToken: string;
}

export interface IGooglePurchases {
    purchaseDataList: IGooglePurchaseData[];
    signatureList: string[];
    purchaseItemList: string[];
}

export class AndroidStoreApi extends NativeApi {

    public readonly onInitialized = new Observable0();
    public readonly onBillingSupportedResult = new Observable2<number, number>();
    public readonly onBillingSupportedError = new Observable3<number, AndroidStoreError, string>();
    public readonly onPurchaseHistoryResult = new Observable2<number, unknown>(); // todo: better typing?
    public readonly onPurchaseHistoryError = new Observable3<number, AndroidStoreError, string>();
    public readonly onSkuDetailsResult = new Observable2<number, unknown>(); // todo: better typing?
    public readonly onSkuDetailsError = new Observable3<number, AndroidStoreError, string>();
    public readonly onBillingStart = new Observable1<IGooglePurchases>();
    public readonly onBillingStartError = new Observable2<AndroidStoreError, string>();
    public readonly onBillingEnd = new Observable1<IGooglePurchases>();
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

    public getPurchases(purchaseType: string): Promise<unknown> { // todo: better typing?
        return this._nativeBridge.invoke<unknown>(this._fullApiClassName, 'getPurchases', [purchaseType]);
    }

    public getPurchaseHistory(operationId: number, purchaseType: string, maxPurchases: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getPurchaseHistory', [operationId, purchaseType, maxPurchases]);
    }

    public getSkuDetails(operationId: number, purchaseType: string, skuList: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getSkuDetails', [operationId, purchaseType, skuList]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case AndroidStoreEvent[AndroidStoreEvent.INITIALIZED]:
                this.onInitialized.trigger();
                break;

            case AndroidStoreEvent[AndroidStoreEvent.BILLING_SUPPORTED_RESULT]:
                this.onBillingSupportedResult.trigger(<number>parameters[0], <number>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.BILLING_SUPPORTED_ERROR]:
                this.onBillingSupportedError.trigger(<number>parameters[0], <AndroidStoreError>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_HISTORY_RESULT]:
                this.onPurchaseHistoryResult.trigger(<number>parameters[0], parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_HISTORY_ERROR]:
                this.onPurchaseHistoryError.trigger(<number>parameters[0], <AndroidStoreError>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.SKU_DETAILS_RESULT]:
                this.onSkuDetailsResult.trigger(<number>parameters[0], parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.SKU_DETAILS_ERROR]:
                this.onSkuDetailsError.trigger(<number>parameters[0], <AndroidStoreError>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.BILLING_START]:
                this.onBillingStart.trigger(parameters[0]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.BILLING_START_ERROR]:
                this.onBillingStartError.trigger(<AndroidStoreError>parameters[0], <string>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.BILLING_END]:
                this.onBillingEnd.trigger(parameters[0]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.BILLING_END_ERROR]:
                this.onBillingEndError.trigger(<AndroidStoreError>parameters[0], <string>parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
