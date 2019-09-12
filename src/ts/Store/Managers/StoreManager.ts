import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { IStoreApi } from 'Store/IStore';
import { Observable1 } from 'Core/Utilities/Observable';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';

export abstract class StoreManager {
    public onStoreTransaction = new Observable1<StoreTransaction>();

    protected _store: IStoreApi;
    private _analyticsManager: IAnalyticsManager;

    constructor(store: IStoreApi, analyticsManager: IAnalyticsManager) {
        this._store = store;
        this._analyticsManager = analyticsManager;

        this.onStoreTransaction.subscribe((transaction) => this._analyticsManager.onTransactionSuccess(transaction));
    }
}
