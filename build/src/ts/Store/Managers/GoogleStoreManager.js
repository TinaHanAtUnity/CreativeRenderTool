import { StoreManager } from 'Store/Managers/StoreManager';
import { GoogleStore } from 'Store/Utilities/GoogleStore';
import { StoreTransaction } from 'Store/Models/StoreTransaction';
export class GoogleStoreManager extends StoreManager {
    constructor(store, analyticsManager) {
        super(store, analyticsManager);
        this._googleStore = new GoogleStore(store);
        this._existingOrderIds = {};
        this._store.Android.Store.onInitialized.subscribe(() => this.onInitialized());
        this._store.Android.Store.onInitializationFailed.subscribe(() => this.onInitializationFailed());
        this._store.Android.Store.onDisconnected.subscribe(() => this.onDisconnected());
        this._store.Android.Store.onPurchaseStatusOnResume.subscribe((activity, data) => this.onPurchaseStatusOnResume(activity, data));
        this._store.Android.Store.onPurchaseStatusOnStop.subscribe((activity, data) => this.onPurchaseStatusOnStop(activity, data));
        this._store.Android.Store.initialize('com.android.vending.billing.InAppBillingService.BIND', 'com.android.vending');
    }
    onInitialized() {
        this._googleStore.isBillingSupported('inapp').then(result => {
            if (result === 0) {
                this._store.Android.Store.startPurchaseTracking(true, ['com.unity3d.services.ads.adunit.AdUnitActivity', 'com.unity3d.services.ads.adunit.AdUnitTransparentActivity'], ['inapp']);
            }
        }).catch(() => {
            // Do nothing
        });
    }
    onInitializationFailed() {
        // Do nothing
    }
    onDisconnected() {
        // Do nothing
    }
    onPurchaseStatusOnResume(activity, data) {
        const orderIds = [];
        if (data.inapp) {
            if (data.inapp.purchaseDataList && data.inapp.purchaseDataList.length > 0) {
                for (const purchaseData of data.inapp.purchaseDataList) {
                    orderIds.push(purchaseData.orderId);
                }
            }
        }
        this._existingOrderIds[activity] = orderIds;
    }
    onPurchaseStatusOnStop(activity, data) {
        if (data.inapp) {
            if (data.inapp.purchaseDataList && data.inapp.purchaseDataList.length > 0) {
                data.inapp.purchaseDataList.forEach((purchaseData, index) => {
                    if (purchaseData.orderId && this.isNewPurchase(activity, purchaseData.orderId)) {
                        if (data.inapp.signatureList && data.inapp.signatureList[index]) {
                            this.logNewPurchase(purchaseData, data.inapp.signatureList[index]);
                        }
                    }
                });
            }
        }
    }
    isNewPurchase(activity, orderId) {
        if (this._existingOrderIds[activity]) {
            if (this._existingOrderIds[activity].indexOf(orderId) !== -1) {
                return false;
            }
        }
        return true;
    }
    logNewPurchase(purchaseData, signature) {
        const timestamp = Date.now();
        this._googleStore.getSkuDetails(purchaseData.productId, 'inapp').then(skuDetails => {
            const transaction = new StoreTransaction(timestamp, purchaseData.productId, skuDetails.price_amount_micros / 1000000, skuDetails.price_currency_code, signature, purchaseData.orderId);
            this.onStoreTransaction.trigger(transaction);
        }).catch(() => {
            // Do nothing
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlU3RvcmVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1N0b3JlL01hbmFnZXJzL0dvb2dsZVN0b3JlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFHM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBR2pFLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxZQUFZO0lBSWhELFlBQVksS0FBZ0IsRUFBRSxnQkFBbUM7UUFDN0QsS0FBSyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRS9CLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7UUFDakcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQWdC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