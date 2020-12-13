import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
export class GoogleStore {
    constructor(store) {
        this._billingCallbackId = 1;
        this._skuCallbackId = 1;
        this._getPurchasesCallbackId = 1;
        this._purchaseHistoryCallbackId = 1;
        this._store = store;
        this._billingSupportedCallbacks = {};
        this._skuDetailsCallbacks = {};
        this._purchaseHistoryCallbacks = {};
        this._store.Android.Store.onBillingSupportedResult.subscribe((operationId, result) => this.onBillingSupportedResult(operationId, result));
        this._store.Android.Store.onBillingSupportedError.subscribe((operationId, error, message) => this.onBillingSupportedError(operationId, error, message));
        this._store.Android.Store.onSkuDetailsResult.subscribe((operationId, result) => this.onSkuDetailsResult(operationId, result));
        this._store.Android.Store.onSkuDetailsError.subscribe((operationId, error, message) => this.onSkuDetailsError(operationId, error, message));
        this._store.Android.Store.onGetPurchasesResult.subscribe((operationId, result) => this.onGetPurchasesResult(operationId, result));
        this._store.Android.Store.onGetPurchasesError.subscribe((operationId, error, message) => this.onGetPurchasesError(operationId, error, message));
        this._store.Android.Store.onPurchaseHistoryResult.subscribe((operationId, result) => this.onPurchaseHistoryResult(operationId, result));
        this._store.Android.Store.onPurchaseHistoryError.subscribe((operationId, error, message) => this.onPurchaseHistoryError(operationId, error, message));
    }
    isBillingSupported(purchaseType) {
        const id = this._billingCallbackId++;
        const promise = new Promise((resolve, reject) => {
            this._billingSupportedCallbacks[id] = new CallbackContainer(resolve, reject);
        });
        this._store.Android.Store.isBillingSupported(id, purchaseType);
        return promise;
    }
    getSkuDetails(productId, purchaseType) {
        const id = this._skuCallbackId++;
        const promise = new Promise((resolve, reject) => {
            this._skuDetailsCallbacks[id] = new CallbackContainer(resolve, reject);
        });
        this._store.Android.Store.getSkuDetails(id, purchaseType, [productId]);
        return promise;
    }
    getPurchases(purchaseType) {
        const id = this._getPurchasesCallbackId++;
        const promise = new Promise((resolve, reject) => {
            this._getPurchasesCallbacks[id] = new CallbackContainer(resolve, reject);
        });
        this._store.Android.Store.getPurchases(id, purchaseType);
        return promise;
    }
    getPurchaseHistory(purchaseType) {
        const id = this._purchaseHistoryCallbackId++;
        const promise = new Promise((resolve, reject) => {
            this._purchaseHistoryCallbacks[id] = new CallbackContainer(resolve, reject);
        });
        this._store.Android.Store.getPurchaseHistory(id, purchaseType, 1000);
        return promise;
    }
    onBillingSupportedResult(operationId, result) {
        this.finishBillingSupportedRequest(true, operationId, result);
    }
    onBillingSupportedError(operationId, error, message) {
        this.finishBillingSupportedRequest(false, operationId);
    }
    onSkuDetailsResult(operationId, result) {
        if (result && result.length === 1) {
            this.finishSkuDetailsRequest(true, operationId, result[0]);
        }
        else {
            this.finishSkuDetailsRequest(false, operationId);
        }
    }
    onSkuDetailsError(operationId, error, message) {
        this.finishSkuDetailsRequest(false, operationId);
    }
    onGetPurchasesResult(operationId, result) {
        this.finishGetPurchasesRequest(true, operationId, result);
    }
    onGetPurchasesError(operationId, error, message) {
        this.finishGetPurchasesRequest(false, operationId);
    }
    onPurchaseHistoryResult(operationId, result) {
        this.finishPurchaseHistoryRequest(true, operationId, result);
    }
    onPurchaseHistoryError(operationId, error, message) {
        this.finishPurchaseHistoryRequest(false, operationId);
    }
    finishBillingSupportedRequest(success, operationId, result) {
        const callback = this._billingSupportedCallbacks[operationId];
        if (callback) {
            if (success) {
                callback.resolve(result);
            }
            else {
                callback.reject();
            }
            delete this._billingSupportedCallbacks[operationId];
        }
    }
    finishSkuDetailsRequest(success, operationId, result) {
        const callback = this._skuDetailsCallbacks[operationId];
        if (callback) {
            if (success) {
                callback.resolve(result);
            }
            else {
                callback.reject();
            }
            delete this._skuDetailsCallbacks[operationId];
        }
    }
    finishGetPurchasesRequest(success, operationId, result) {
        const callback = this._getPurchasesCallbacks[operationId];
        if (callback) {
            if (success) {
                callback.resolve(result);
            }
            else {
                callback.reject();
            }
            delete this._getPurchasesCallbacks[operationId];
        }
    }
    finishPurchaseHistoryRequest(success, operationId, result) {
        const callback = this._purchaseHistoryCallbacks[operationId];
        if (callback) {
            if (success) {
                callback.resolve(result);
            }
            else {
                callback.reject();
            }
            delete this._purchaseHistoryCallbacks[operationId];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlU3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvVXRpbGl0aWVzL0dvb2dsZVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBR3pFLE1BQU0sT0FBTyxXQUFXO0lBV3BCLFlBQVksS0FBZ0I7UUFUcEIsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1FBQy9CLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBQzNCLDRCQUF1QixHQUFXLENBQUMsQ0FBQztRQUNwQywrQkFBMEIsR0FBVyxDQUFDLENBQUM7UUFPM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxFQUFFLENBQUM7UUFFcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMzSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDekosSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxN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