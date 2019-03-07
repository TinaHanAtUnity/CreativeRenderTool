import { StoreManager } from 'Store/Managers/StoreManager';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';
import { IAppleTransaction } from 'Store/Native/iOS/Products';
import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { AppleStore } from 'Store/Utilities/AppleStore';
import { PaymentTransactionState } from 'Store/Constants/iOS/PaymentTransactionState';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class AppleStoreManager extends StoreManager {
    private _appleStore: AppleStore;

    constructor(core: ICore, store: IStoreApi) {
        super(core, store);

        this._appleStore = new AppleStore(store);
    }

    public startTracking(): void {
        this._store.iOS!.Products.onTransaction.subscribe((data) => this.onTransaction(data));

        this._store.iOS!.Products.startTransactionObserver();
    }

    private onTransaction(data: IAppleTransaction[]): void {
        for(const transaction of data) {
            this.processTransaction(transaction);
        }
    }

    private processTransaction(transaction: IAppleTransaction) {
        const timestamp = Date.now();

        if(transaction.productId && transaction.receipt && transaction.transactionState && transaction.transactionState && transaction.transactionState === PaymentTransactionState.PURCHASED) {
            this._appleStore.getProductInfo(transaction.productId).then(product => {
                if(product.price && product.priceLocale.currencyCode) {
                    const storeTransaction = new StoreTransaction(timestamp, transaction.productId, product.price, product.priceLocale.currencyCode, transaction.receipt);

                    this.onStoreTransaction.trigger(storeTransaction);
                } else {
                    Diagnostics.trigger('store_getproduct_info_missing', {
                        productId: transaction.productId,
                        price: product.price,
                        currencyCode: product.priceLocale.currencyCode
                    });
                }
            }).catch(() => {
                Diagnostics.trigger('store_getproduct_failed', {
                    productId: transaction.productId
                });
            });
        }
    }
}
