import { IStoreApi } from 'Store/IStore';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
import { AndroidStoreError, IGooglePurchases, IGoogleSkuDetails } from 'Store/Native/Android/Store';

export class GoogleStore {
    private _store: IStoreApi;
    private _billingCallbackId: number = 1;
    private _skuCallbackId: number = 1;
    private _getPurchasesCallbackId: number = 1;
    private _purchaseHistoryCallbackId: number = 1;
    private _billingSupportedCallbacks: { [requestId: number]: CallbackContainer<number> };
    private _skuDetailsCallbacks: { [requestId: number]: CallbackContainer<IGoogleSkuDetails> };
    private _getPurchasesCallbacks: { [requestId: number]: CallbackContainer<IGooglePurchases> };
    private _purchaseHistoryCallbacks:  { [requestId: number]: CallbackContainer<IGooglePurchases> };

    constructor(store: IStoreApi) {
        this._store = store;
        this._billingSupportedCallbacks = {};
        this._skuDetailsCallbacks = {};
        this._purchaseHistoryCallbacks = {};

        this._store.Android!.Store.onBillingSupportedResult.subscribe((operationId, result) => this.onBillingSupportedResult(operationId, result));
        this._store.Android!.Store.onBillingSupportedError.subscribe((operationId, error, message) => this.onBillingSupportedError(operationId, error, message));
        this._store.Android!.Store.onSkuDetailsResult.subscribe((operationId, result) => this.onSkuDetailsResult(operationId, result));
        this._store.Android!.Store.onSkuDetailsError.subscribe((operationId, error, message) => this.onSkuDetailsError(operationId, error, message));
        this._store.Android!.Store.onGetPurchasesResult.subscribe((operationId, result) => this.onGetPurchasesResult(operationId, result));
        this._store.Android!.Store.onGetPurchasesError.subscribe((operationId, error, message) => this.onGetPurchasesError(operationId, error, message));
        this._store.Android!.Store.onPurchaseHistoryResult.subscribe((operationId, result) => this.onPurchaseHistoryResult(operationId, result));
        this._store.Android!.Store.onPurchaseHistoryError.subscribe((operationId, error, message) => this.onPurchaseHistoryError(operationId, error, message));
    }

    public isBillingSupported(purchaseType: string): Promise<number> {
        const id = this._billingCallbackId++;

        const promise = new Promise<number>((resolve, reject) => {
            this._billingSupportedCallbacks[id] = new CallbackContainer(resolve, reject);
        });

        this._store.Android!.Store.isBillingSupported(id, purchaseType);

        return promise;
    }

    public getSkuDetails(productId: string, purchaseType: string): Promise<IGoogleSkuDetails> {
        const id = this._skuCallbackId++;

        const promise = new Promise<IGoogleSkuDetails>((resolve, reject) => {
            this._skuDetailsCallbacks[id] = new CallbackContainer<IGoogleSkuDetails>(resolve, reject);
        });

        this._store.Android!.Store.getSkuDetails(id, purchaseType, [productId]);

        return promise;
    }

    public getPurchases(purchaseType: string): Promise<IGooglePurchases> {
        const id = this._getPurchasesCallbackId++;

        const promise = new Promise<IGooglePurchases>((resolve, reject) => {
            this._getPurchasesCallbacks[id] = new CallbackContainer<IGooglePurchases>(resolve, reject);
        });

        this._store.Android!.Store.getPurchases(id, purchaseType);

        return promise;
    }

    public getPurchaseHistory(purchaseType: string): Promise<IGooglePurchases> {
        const id = this._purchaseHistoryCallbackId++;

        const promise = new Promise<IGooglePurchases>((resolve, reject) => {
            this._purchaseHistoryCallbacks[id] = new CallbackContainer<IGooglePurchases>(resolve, reject);
        });

        this._store.Android!.Store.getPurchaseHistory(id, purchaseType, 1000);

        return promise;
    }

    private onBillingSupportedResult(operationId: number, result: number) {
        this.finishBillingSupportedRequest(true, operationId, result);
    }

    private onBillingSupportedError(operationId: number, error: AndroidStoreError, message: string) {
        this.finishBillingSupportedRequest(false, operationId);
    }

    private onSkuDetailsResult(operationId: number, result: IGoogleSkuDetails[]) {
        if (result && result.length === 1) {
            this.finishSkuDetailsRequest(true, operationId, result[0]);
        } else {
            this.finishSkuDetailsRequest(false, operationId);
        }
    }

    private onSkuDetailsError(operationId: number, error: AndroidStoreError, message: string) {
        this.finishSkuDetailsRequest(false, operationId);
    }

    private onGetPurchasesResult(operationId: number, result: IGooglePurchases) {
        this.finishGetPurchasesRequest(true, operationId, result);
    }

    private onGetPurchasesError(operationId: number, error: AndroidStoreError, message: string) {
        this.finishGetPurchasesRequest(false, operationId);
    }

    private onPurchaseHistoryResult(operationId: number, result: IGooglePurchases) {
        this.finishPurchaseHistoryRequest(true, operationId, result);
    }

    private onPurchaseHistoryError(operationId: number, error: AndroidStoreError, message: string) {
        this.finishPurchaseHistoryRequest(false, operationId);
    }

    private finishBillingSupportedRequest(success: boolean, operationId: number, result?: number) {
        const callback = this._billingSupportedCallbacks[operationId];

        if (callback) {
            if (success) {
                callback.resolve(result);
            } else {
                callback.reject();
            }

            delete this._billingSupportedCallbacks[operationId];
        }
    }

    private finishSkuDetailsRequest(success: boolean, operationId: number, result?: IGoogleSkuDetails) {
        const callback = this._skuDetailsCallbacks[operationId];

        if (callback) {
            if (success) {
                callback.resolve(result);
            } else {
                callback.reject();
            }

            delete this._skuDetailsCallbacks[operationId];
        }
    }

    private finishGetPurchasesRequest(success: boolean, operationId: number, result?: IGooglePurchases) {
        const callback = this._getPurchasesCallbacks[operationId];

        if (callback) {
            if (success) {
                callback.resolve(result);
            } else {
                callback.reject();
            }

            delete this._getPurchasesCallbacks[operationId];
        }
    }

    private finishPurchaseHistoryRequest(success: boolean, operationId: number, result?: IGooglePurchases) {
        const callback = this._purchaseHistoryCallbacks[operationId];

        if (callback) {
            if (success) {
                callback.resolve(result);
            } else {
                callback.reject();
            }

            delete this._purchaseHistoryCallbacks[operationId];
        }
    }
}
