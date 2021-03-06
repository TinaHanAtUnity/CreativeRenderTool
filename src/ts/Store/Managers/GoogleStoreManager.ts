import { StoreManager } from 'Store/Managers/StoreManager';
import { IStoreApi } from 'Store/IStore';
import { IGooglePurchaseData, IGooglePurchaseStatus } from 'Store/Native/Android/Store';
import { GoogleStore } from 'Store/Utilities/GoogleStore';
import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';

export class GoogleStoreManager extends StoreManager {
    private _googleStore: GoogleStore;
    private _existingOrderIds: { [activity: string]: string[] };

    constructor(store: IStoreApi, analyticsManager: IAnalyticsManager) {
        super(store, analyticsManager);

        this._googleStore = new GoogleStore(store);
        this._existingOrderIds = {};

        this._store.Android!.Store.onInitialized.subscribe(() => this.onInitialized());
        this._store.Android!.Store.onInitializationFailed.subscribe(() => this.onInitializationFailed());
        this._store.Android!.Store.onDisconnected.subscribe(() => this.onDisconnected());
        this._store.Android!.Store.onPurchaseStatusOnResume.subscribe((activity: string, data: IGooglePurchaseStatus) => this.onPurchaseStatusOnResume(activity, data));
        this._store.Android!.Store.onPurchaseStatusOnStop.subscribe((activity: string, data: IGooglePurchaseStatus) => this.onPurchaseStatusOnStop(activity, data));

        this._store.Android!.Store.initialize('com.android.vending.billing.InAppBillingService.BIND', 'com.android.vending');
    }

    private onInitialized() {
        this._googleStore.isBillingSupported('inapp').then(result => {
            if (result === 0) {
                this._store.Android!.Store.startPurchaseTracking(true, ['com.unity3d.services.ads.adunit.AdUnitActivity', 'com.unity3d.services.ads.adunit.AdUnitTransparentActivity'], ['inapp']);
            }
        }).catch(() => {
            // Do nothing
        });
    }

    private onInitializationFailed() {
        // Do nothing
    }

    private onDisconnected() {
        // Do nothing
    }

    private onPurchaseStatusOnResume(activity: string, data: IGooglePurchaseStatus) {
        const orderIds: string[] = [];

        if (data.inapp) {
            if (data.inapp.purchaseDataList && data.inapp.purchaseDataList.length > 0) {
                for (const purchaseData of data.inapp.purchaseDataList) {
                    orderIds.push(purchaseData.orderId);
                }
            }
        }

        this._existingOrderIds[activity] = orderIds;
    }

    private onPurchaseStatusOnStop(activity: string, data: IGooglePurchaseStatus) {
        if (data.inapp) {
            if (data.inapp.purchaseDataList && data.inapp.purchaseDataList.length > 0) {
                data.inapp.purchaseDataList.forEach((purchaseData: IGooglePurchaseData, index: number) => {
                    if (purchaseData.orderId && this.isNewPurchase(activity, purchaseData.orderId)) {
                        if (data.inapp!.signatureList && data.inapp!.signatureList[index]) {
                            this.logNewPurchase(purchaseData, data.inapp!.signatureList[index]);
                        }
                    }
                });
            }
        }
    }

    private isNewPurchase(activity: string, orderId: string) {
        if (this._existingOrderIds[activity]) {
            if (this._existingOrderIds[activity].indexOf(orderId) !== -1) {
                return false;
            }
        }

        return true;
    }

    private logNewPurchase(purchaseData: IGooglePurchaseData, signature: string) {
        const timestamp = Date.now();

        this._googleStore.getSkuDetails(purchaseData.productId, 'inapp').then(skuDetails => {
            const transaction = new StoreTransaction(timestamp, purchaseData.productId, skuDetails.price_amount_micros / 1000000, skuDetails.price_currency_code, signature, purchaseData.orderId);
            this.onStoreTransaction.trigger(transaction);
        }).catch(() => {
            // Do nothing
        });
    }
}
