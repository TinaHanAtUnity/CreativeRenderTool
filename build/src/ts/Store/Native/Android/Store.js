import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable0, Observable2, Observable3 } from 'Core/Utilities/Observable';
var AndroidStoreEvent;
(function (AndroidStoreEvent) {
    AndroidStoreEvent[AndroidStoreEvent["INITIALIZED"] = 0] = "INITIALIZED";
    AndroidStoreEvent[AndroidStoreEvent["INITIALIZATION_FAILED"] = 1] = "INITIALIZATION_FAILED";
    AndroidStoreEvent[AndroidStoreEvent["DISCONNECTED"] = 2] = "DISCONNECTED";
    AndroidStoreEvent[AndroidStoreEvent["PURCHASE_STATUS_ON_RESUME"] = 3] = "PURCHASE_STATUS_ON_RESUME";
    AndroidStoreEvent[AndroidStoreEvent["PURCHASE_STATUS_ON_STOP"] = 4] = "PURCHASE_STATUS_ON_STOP";
    AndroidStoreEvent[AndroidStoreEvent["PURCHASE_STATUS_ON_RESUME_ERROR"] = 5] = "PURCHASE_STATUS_ON_RESUME_ERROR";
    AndroidStoreEvent[AndroidStoreEvent["PURCHASE_STATUS_ON_STOP_ERROR"] = 6] = "PURCHASE_STATUS_ON_STOP_ERROR";
    AndroidStoreEvent[AndroidStoreEvent["GETPURCHASES_RESULT"] = 7] = "GETPURCHASES_RESULT";
    AndroidStoreEvent[AndroidStoreEvent["GETPURCHASES_ERROR"] = 8] = "GETPURCHASES_ERROR";
    AndroidStoreEvent[AndroidStoreEvent["PURCHASE_HISTORY_RESULT"] = 9] = "PURCHASE_HISTORY_RESULT";
    AndroidStoreEvent[AndroidStoreEvent["PURCHASE_HISTORY_ERROR"] = 10] = "PURCHASE_HISTORY_ERROR";
    AndroidStoreEvent[AndroidStoreEvent["SKU_DETAILS_RESULT"] = 11] = "SKU_DETAILS_RESULT";
    AndroidStoreEvent[AndroidStoreEvent["SKU_DETAILS_ERROR"] = 12] = "SKU_DETAILS_ERROR";
    AndroidStoreEvent[AndroidStoreEvent["BILLING_SUPPORTED_RESULT"] = 13] = "BILLING_SUPPORTED_RESULT";
    AndroidStoreEvent[AndroidStoreEvent["BILLING_SUPPORTED_ERROR"] = 14] = "BILLING_SUPPORTED_ERROR";
})(AndroidStoreEvent || (AndroidStoreEvent = {}));
export var AndroidStoreError;
(function (AndroidStoreError) {
    AndroidStoreError[AndroidStoreError["NOT_INITIALIZED"] = 0] = "NOT_INITIALIZED";
    AndroidStoreError[AndroidStoreError["CLASS_NOT_FOUND"] = 1] = "CLASS_NOT_FOUND";
    AndroidStoreError[AndroidStoreError["NO_SUCH_METHOD"] = 2] = "NO_SUCH_METHOD";
    AndroidStoreError[AndroidStoreError["INVOCATION_TARGET"] = 3] = "INVOCATION_TARGET";
    AndroidStoreError[AndroidStoreError["ILLEGAL_ACCESS"] = 4] = "ILLEGAL_ACCESS";
    AndroidStoreError[AndroidStoreError["JSON_ERROR"] = 5] = "JSON_ERROR";
    AndroidStoreError[AndroidStoreError["STORE_ERROR"] = 6] = "STORE_ERROR";
    AndroidStoreError[AndroidStoreError["UNKNOWN_ERROR"] = 7] = "UNKNOWN_ERROR";
})(AndroidStoreError || (AndroidStoreError = {}));
export class AndroidStoreApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Store', ApiPackage.STORE, EventCategory.STORE);
        this.onInitialized = new Observable0();
        this.onInitializationFailed = new Observable0();
        this.onDisconnected = new Observable0();
        this.onBillingSupportedResult = new Observable2();
        this.onBillingSupportedError = new Observable3();
        this.onGetPurchasesResult = new Observable2();
        this.onGetPurchasesError = new Observable3();
        this.onPurchaseHistoryResult = new Observable2();
        this.onPurchaseHistoryError = new Observable3();
        this.onSkuDetailsResult = new Observable2();
        this.onSkuDetailsError = new Observable3();
        this.onPurchaseStatusOnResume = new Observable2();
        this.onPurchaseStatusOnResumeError = new Observable3();
        this.onPurchaseStatusOnStop = new Observable2();
        this.onPurchaseStatusOnStopError = new Observable3();
    }
    initialize(intentName, intentPackage) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'initialize', [intentName, intentPackage]);
    }
    startPurchaseTracking(trackAllActivities, exceptions, purchaseTypes) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'startPurchaseTracking', [trackAllActivities, exceptions, purchaseTypes]);
    }
    stopPurchaseTracking() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'stopPurchaseTracking');
    }
    isBillingSupported(operationId, purchaseType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isBillingSupported', [operationId, purchaseType]);
    }
    getPurchases(operationId, purchaseType) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getPurchases', [operationId, purchaseType]);
    }
    getPurchaseHistory(operationId, purchaseType, maxPurchases) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getPurchaseHistory', [operationId, purchaseType, maxPurchases]);
    }
    getSkuDetails(operationId, purchaseType, skuList) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSkuDetails', [operationId, purchaseType, skuList]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case AndroidStoreEvent[AndroidStoreEvent.INITIALIZED]:
                this.onInitialized.trigger();
                break;
            case AndroidStoreEvent[AndroidStoreEvent.INITIALIZATION_FAILED]:
                this.onInitializationFailed.trigger();
                break;
            case AndroidStoreEvent[AndroidStoreEvent.DISCONNECTED]:
                this.onDisconnected.trigger();
                break;
            case AndroidStoreEvent[AndroidStoreEvent.BILLING_SUPPORTED_RESULT]:
                this.onBillingSupportedResult.trigger(parameters[0], parameters[1]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.BILLING_SUPPORTED_ERROR]:
                this.onBillingSupportedError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.GETPURCHASES_RESULT]:
                this.onGetPurchasesResult.trigger(parameters[0], parameters[1]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.GETPURCHASES_ERROR]:
                this.onGetPurchasesError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_HISTORY_RESULT]:
                this.onPurchaseHistoryResult.trigger(parameters[0], parameters[1]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_HISTORY_ERROR]:
                this.onPurchaseHistoryError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.SKU_DETAILS_RESULT]:
                this.onSkuDetailsResult.trigger(parameters[0], parameters[1]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.SKU_DETAILS_ERROR]:
                this.onSkuDetailsError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_RESUME]:
                this.onPurchaseStatusOnResume.trigger(parameters[0], parameters[1]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_RESUME_ERROR]:
                this.onPurchaseStatusOnResumeError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_STOP]:
                this.onPurchaseStatusOnStop.trigger(parameters[0], parameters[1]);
                break;
            case AndroidStoreEvent[AndroidStoreEvent.PURCHASE_STATUS_ON_STOP_ERROR]:
                this.onPurchaseStatusOnStopError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvTmF0aXZlL0FuZHJvaWQvU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFFLFdBQVcsRUFBZSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFL0YsSUFBSyxpQkFnQko7QUFoQkQsV0FBSyxpQkFBaUI7SUFDbEIsdUVBQVcsQ0FBQTtJQUNYLDJGQUFxQixDQUFBO0lBQ3JCLHlFQUFZLENBQUE7SUFDWixtR0FBeUIsQ0FBQTtJQUN6QiwrRkFBdUIsQ0FBQTtJQUN2QiwrR0FBK0IsQ0FBQTtJQUMvQiwyR0FBNkIsQ0FBQTtJQUM3Qix1RkFBbUIsQ0FBQTtJQUNuQixxRkFBa0IsQ0FBQTtJQUNsQiwrRkFBdUIsQ0FBQTtJQUN2Qiw4RkFBc0IsQ0FBQTtJQUN0QixzRkFBa0IsQ0FBQTtJQUNsQixvRkFBaUIsQ0FBQTtJQUNqQixrR0FBd0IsQ0FBQTtJQUN4QixnR0FBdUIsQ0FBQTtBQUMzQixDQUFDLEVBaEJJLGlCQUFpQixLQUFqQixpQkFBaUIsUUFnQnJCO0FBRUQsTUFBTSxDQUFOLElBQVksaUJBU1g7QUFURCxXQUFZLGlCQUFpQjtJQUN6QiwrRUFBZSxDQUFBO0lBQ2YsK0VBQWUsQ0FBQTtJQUNmLDZFQUFjLENBQUE7SUFDZCxtRkFBaUIsQ0FBQTtJQUNqQiw2RUFBYyxDQUFBO0lBQ2QscUVBQVUsQ0FBQTtJQUNWLHVFQUFXLENBQUE7SUFDWCwyRUFBYSxDQUFBO0FBQ2pCLENBQUMsRUFUVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBUzVCO0FBMkNELE1BQU0sT0FBTyxlQUFnQixTQUFRLFNBQVM7SUFrQjFDLFlB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