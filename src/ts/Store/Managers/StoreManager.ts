import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';
import { Observable1 } from 'Core/Utilities/Observable';

export abstract class StoreManager {
    public onStoreTransaction = new Observable1<StoreTransaction>();

    protected _core: ICore;
    protected _store: IStoreApi;

    constructor(core: ICore, store: IStoreApi) {
        this._core = core;
        this._store = store;

        this.onStoreTransaction.subscribe((transaction) => this.sendDiagnosticsTransaction(transaction));
    }

    public abstract startTracking(): void;

    public sendDiagnosticsTransaction(transaction: StoreTransaction) {
        // when feature has been validated in production, this functionality should be removed
        // however this functionality is essential in rollout phase where we should compare SDK diagnostics with production data pipeline
        Diagnostics.trigger('store_transaction', {
            timestamp: transaction.getTimestamp(),
            productId: transaction.getProductId(),
            amount: transaction.getAmount(),
            currency: transaction.getCurrency(),
            receipt: transaction.getReceipt()
        });
    }
}
