import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0, Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';

enum AndroidStoreEvent {
    INITIALIZED,
    PURCHASE_STATUS_ON_RESUME,
    PURCHASE_STATUS_ON_STOP,
    PURCHASE_STATUS_ON_RESUME_ERROR,
    PURCHASE_STATUS_ON_STOP_ERROR,
    GETPURCHASES_RESULT,
    GETPURCHASES_ERROR,
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

// interfaces as documented at https://developer.android.com/google/play/billing/billing_reference

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

export interface IGooglePurchaseStatus {
    inapp?: IGooglePurchases;
    subs?: IGooglePurchases;
}

export interface IGoogleSkuDetails {
    productId: string;
    type: string;
    price: string;
    price_amount_micros: number;
    price_currency_code: string;
    title: string;
    description: string;
    // fields below are only for subscriptions
    subscriptionPeriod?: string;
    trialPeriod?: string;
    introductoryPrice?: string;
    introductoryPriceAmountMicros?: number;
    introductoryPricePeriod?: string;
    introductoryPriceCycles?: number;
}

export class AndroidStoreApi extends NativeApi {

    public readonly onInitialized = new Observable0();
    public readonly onBillingSupportedResult = new Observable2<number, number>();
    public readonly onBillingSupportedError = new Observable3<number, AndroidStoreError, string>();
    public readonly onGetPurchasesResult = new Observable2<number, IGooglePurchases>();
    public readonly onGetPurchasesError = new Observable3<number, AndroidStoreError, string>();
    public readonly onPurchaseHistoryResult = new Observable2<number, IGooglePurchases>();
    public readonly onPurchaseHistoryError = new Observable3<number, AndroidStoreError, string>();
    public readonly onSkuDetailsResult = new Observable2<number, IGoogleSkuDetails[]>();
    public readonly onSkuDetailsError = new Observable3<number, AndroidStoreError, string>();
    public readonly onPurchaseStatusOnResume = new Observable2<string, IGooglePurchaseStatus>();
    public readonly onPurchaseStatusOnResumeError = new Observable3<AndroidStoreError, string, string>();
    public readonly onPurchaseStatusOnStop = new Observable2<string, IGooglePurchaseStatus>();
    public readonly onPurchaseStatusOnStopError = new Observable3<AndroidStoreError, string, string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Store', ApiPackage.STORE, EventCategory.STORE);
    }

    public initialize(intentName: string, intentPackage: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'initialize', [intentName, intentPackage]);
    }

    public startPurchaseTracking(trackAllActivities: boolean, exceptions: string[], purchaseTypes: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'startPurchaseTracking', [trackAllActivities, exceptions, purchaseTypes]);
    }

    public stopPurchaseTracking(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'stopPurchaseTracking');
    }

    public isBillingSupported(operationId: number, purchaseType: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'isBillingSupported', [operationId, purchaseType]);
    }

    public getPurchases(operationId: number, purchaseType: string): Promise<IGooglePurchases> {
        return this._nativeBridge.invoke<IGooglePurchases>(this._fullApiClassName, 'getPurchases', [operationId, purchaseType]);
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

            case AndroidStoreEvent[AndroidStoreEvent.GETPURCHASES_RESULT]:
                this.onGetPurchasesResult.trigger(<number>parameters[0], <IGooglePurchases>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.GETPURCHASES_ERROR]:
                this.onGetPurchasesError.trigger(<number>parameters[0], <AndroidStoreError>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_HISTORY_RESULT]:
                this.onPurchaseHistoryResult.trigger(<number>parameters[0], <IGooglePurchases>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_HISTORY_ERROR]:
                this.onPurchaseHistoryError.trigger(<number>parameters[0], <AndroidStoreError>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.SKU_DETAILS_RESULT]:
                this.onSkuDetailsResult.trigger(<number>parameters[0], <IGoogleSkuDetails[]>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.SKU_DETAILS_ERROR]:
                this.onSkuDetailsError.trigger(<number>parameters[0], <AndroidStoreError>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_RESUME]:
                this.onPurchaseStatusOnResume.trigger(<string>parameters[0], <IGooglePurchaseStatus>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_RESUME_ERROR]:
                this.onPurchaseStatusOnResumeError.trigger(<AndroidStoreError>parameters[0], <string>parameters[1], <string>parameters[2]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_STOP]:
                this.onPurchaseStatusOnStop.trigger(<string>parameters[0], <IGooglePurchaseStatus>parameters[1]);
                break;

            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_STOP_ERROR]:
                this.onPurchaseStatusOnStopError.trigger(<AndroidStoreError>parameters[0], <string>parameters[1], <string>parameters[2]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
