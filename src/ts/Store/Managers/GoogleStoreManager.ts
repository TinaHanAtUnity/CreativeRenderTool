import { StoreManager } from 'Store/Managers/StoreManager';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';
import { IGooglePurchaseData, IGooglePurchases } from 'Store/Native/Android/Store';
import { GoogleStore } from 'Store/Utilities/GoogleStore';
import { StoreTransaction } from 'Store/Models/StoreTransaction';

export class GoogleStoreManager extends StoreManager {
    private _googleStore: GoogleStore;
    private _existingOrderIds: string[];

    constructor(core: ICore, store: IStoreApi) {
        super(core, store);

        this._googleStore = new GoogleStore(store);
    }

    public startTracking(): void {
        this._store.Android!.Store.onInitialized.subscribe(() => this.onInitialized());
        this._store.Android!.Store.onBillingStart.subscribe((data: IGooglePurchases) => this.onBillingStart(data));
        this._store.Android!.Store.onBillingEnd.subscribe((data: IGooglePurchases) => this.onBillingEnd(data));

        this._store.Android!.Store.initialize();
    }

    private onInitialized() {
        this._store.Android!.Store.setListenerState(true);

        // todo: check isBillingSupported properly instead of just logging the result
        this._googleStore.isBillingSupported('inapp').then(result => {
            this._core.Api.Sdk.logInfo('GOOGLE INAPP BILLING SUPPORTED: ' + result);
        });

        this._googleStore.isBillingSupported('subs').then(result => {
            this._core.Api.Sdk.logInfo('GOOGLE SUBSCRIPTION BILLING SUPPORTED: ' + result);
        });
    }

    private onBillingStart(data: IGooglePurchases) {
        this._core.Api.Sdk.logInfo('GOOGLE BILLING START: ' + JSON.stringify(data)); // todo: remove debug logging before merging to master

        this._existingOrderIds = [];

        if(data.purchaseDataList && data.purchaseDataList.length > 0) {
            for(const purchaseData of data.purchaseDataList) {
                this._existingOrderIds.push(purchaseData.orderId);
            }
        }
    }

    private onBillingEnd(data: IGooglePurchases) {
        this._core.Api.Sdk.logInfo('GOOGLE BILLING END: ' + JSON.stringify(data)); // todo: remove debug logging before merging to master

        if(data.purchaseDataList && data.purchaseDataList.length > 0) {
            data.purchaseDataList.forEach((purchaseData: IGooglePurchaseData, index: number) => {
                if(purchaseData.orderId && this.isNewPurchase(purchaseData.orderId)) {
                    if(data.signatureList && data.signatureList[index]) {
                        this.logNewPurchase(purchaseData, data.signatureList[index]);
                    } else {
                        this.logNewPurchase(purchaseData, 'SIGNATUREMISSING');
                        // todo: proper error handling
                    }
                }
            });
        }

        this._googleStore.getPurchaseHistory('inapp').then(history => {
            this._core.Api.Sdk.logInfo('GOOGLE INAPP PURCHASE HISTORY: ' + JSON.stringify(history));
        });
    }

    private isNewPurchase(orderId: string) {
        if(this._existingOrderIds) {
            if(this._existingOrderIds.indexOf(orderId) !== -1) {
                return false;
            }
        }

        return true;
    }

    private logNewPurchase(purchaseData: IGooglePurchaseData, signature: string) {
        const timestamp = Date.now();

        this._googleStore.getSkuDetails(purchaseData.productId, 'inapp').then(skuDetails => {
            const transaction = new StoreTransaction(timestamp, purchaseData.productId, skuDetails.price_amount_micros * 1000000, skuDetails.price_currency_code, signature);
            this.sendTransaction(transaction);
        });
    }
}
