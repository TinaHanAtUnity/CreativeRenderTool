import { StoreManager } from 'Store/Managers/StoreManager';
import { IStoreApi } from 'Store/IStore';
import { IAppleTransaction } from 'Store/Native/iOS/Products';
import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { AppleStore } from 'Store/Utilities/AppleStore';
import { PaymentTransactionState } from 'Store/Constants/iOS/PaymentTransactionState';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';

export class AppleStoreManager extends StoreManager {
    private _appleStore: AppleStore;

    constructor(store: IStoreApi, analyticsManager: IAnalyticsManager) {
        super(store, analyticsManager);

        this._appleStore = new AppleStore(store);

        this._store.iOS!.Products.onTransaction.subscribe((data) => this.onTransaction(data));

        this._store.iOS!.Products.startTransactionObserver();
    }

    private onTransaction(data: IAppleTransaction[]): void {
        for (const transaction of data) {
            this.processTransaction(transaction);
        }
    }

    private processTransaction(transaction: IAppleTransaction) {
        const timestamp = Date.now();

        if (transaction.productId && transaction.receipt && transaction.transactionState && transaction.transactionState && transaction.transactionState === PaymentTransactionState.PURCHASED) {
            this._appleStore.getProductInfo(transaction.productId).then(product => {
                if (product.price && product.priceLocale.currencyCode) {
                    const storeTransaction = new StoreTransaction(timestamp, transaction.productId, product.price, product.priceLocale.currencyCode, transaction.receipt, transaction.transactionIdentifier);

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
        } else {
            Diagnostics.trigger('store_apple_transaction_not_processed', {
                hasProductId: transaction.productId ? true : false,
                hasReceipt: transaction.receipt ? true : false,
                transactionState: transaction.transactionState
            });
        }
    }
}
