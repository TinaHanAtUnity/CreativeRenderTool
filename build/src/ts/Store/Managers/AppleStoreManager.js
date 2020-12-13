import { StoreManager } from 'Store/Managers/StoreManager';
import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { AppleStore } from 'Store/Utilities/AppleStore';
import { PaymentTransactionState } from 'Store/Constants/iOS/PaymentTransactionState';
export class AppleStoreManager extends StoreManager {
    constructor(store, analyticsManager) {
        super(store, analyticsManager);
        this._appleStore = new AppleStore(store);
        this._store.iOS.Products.onTransaction.subscribe((data) => this.onTransaction(data));
        this._store.iOS.Products.startTransactionObserver();
    }
    onTransaction(data) {
        for (const transaction of data) {
            this.processTransaction(transaction);
        }
    }
    processTransaction(transaction) {
        const timestamp = Date.now();
        if (transaction.productId && transaction.receipt && transaction.transactionState && transaction.transactionState && transaction.transactionState === PaymentTransactionState.PURCHASED) {
            this._appleStore.getProductInfo(transaction.productId).then(product => {
                if (product.price && product.priceLocale.currencyCode) {
                    const storeTransaction = new StoreTransaction(timestamp, transaction.productId, product.price, product.priceLocale.currencyCode, transaction.receipt, transaction.transactionIdentifier);
                    this.onStoreTransaction.trigger(storeTransaction);
                }
            }).catch(() => {
                // Do nothing
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGVTdG9yZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvTWFuYWdlcnMvQXBwbGVTdG9yZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzNELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUd0RixNQUFNLE9BQU8saUJBQWtCLFNBQVEsWUFBWTtJQUcvQyxZQUFZLEtBQWdCLEVBQUUsZ0JBQW1DO1FBQzdELEtBQUssQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFdEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDekQsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUF5QjtRQUMzQyxLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksRUFBRTtZQUM1QixJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDeEM7SUFDTCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsV0FBOEI7UUFDckQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRTdCLElBQUksV0FBVyxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLElBQUksV0FBVyxDQUFDLGdCQUFnQixLQUFLLHVCQUF1QixDQUFDLFNBQVMsRUFBRTtZQUNwTCxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNsRSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUU7b0JBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBRXpMLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDckQ7WUFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNWLGFBQWE7WUFDakIsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7Q0FDSiJ9