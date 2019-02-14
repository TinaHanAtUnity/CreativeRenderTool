import { StoreManager } from 'Store/Managers/StoreManager';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';
import { IGooglePurchaseData, IGooglePurchases } from 'Store/Native/Android/Store';

export class GoogleStoreManager extends StoreManager {
    private _existingOrderIds: string[];

    constructor(core: ICore, store: IStoreApi) {
        super(core, store);
    }

    public startTracking(): void {
        this._store.Android!.Store.onInitialized.subscribe(() => this.onInitialized());
        this._store.Android!.Store.onBillingStart.subscribe((data: IGooglePurchases) => this.onBillingStart(data));
        this._store.Android!.Store.onBillingEnd.subscribe((data: IGooglePurchases) => this.onBillingEnd(data));

        this._store.Android!.Store.initialize();
    }

    private onInitialized() {
        this._store.Android!.Store.setListenerState(true);
    }

    private onBillingStart(data: IGooglePurchases) {
        this._core.Api.Sdk.logInfo('GOOGLE BILLING START: ' + JSON.stringify(data));

        this._existingOrderIds = [];

        if(data.purchaseDataList && data.purchaseDataList.length > 0) {
            for(let purchaseData of data.purchaseDataList) {
                this._existingOrderIds.push(purchaseData.orderId);
            }
        }
    }

    private onBillingEnd(data: IGooglePurchases) {
        this._core.Api.Sdk.logInfo('GOOGLE BILLING END: ' + JSON.stringify(data));

        if(data.purchaseDataList && data.purchaseDataList.length > 0) {
            data.purchaseDataList.forEach((purchaseData: IGooglePurchaseData, index: number) => {
                if(purchaseData.orderId && this.isNewPurchase(purchaseData.orderId)) {
                    if(data.signatureList && data.signatureList[index]) {
                        this.logNewPurchase(purchaseData, data.signatureList[index]);
                    }
                }
            });
        }
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

        // todo: implement method
    }
}
