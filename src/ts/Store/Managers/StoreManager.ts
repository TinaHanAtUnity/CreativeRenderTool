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

        this.onStoreTransaction.subscribe((transaction) => this.sendTestTransaction(transaction));
    }

    public abstract startTracking(): void;

    // todo: remove this test code before merging to master
    public sendTestTransaction(transaction: StoreTransaction) {
        this._core.Api.Sdk.logInfo('TEST TRANSACTION CAPTURED! TIMESTAMP: ' + transaction.getTimestamp() + ' PRODUCT ID: ' + transaction.getProductId() + ' AMOUNT: ' + transaction.getAmount() + ' CURRENCY: ' + transaction.getCurrency() + ' RECEIPT: ' + transaction.getReceipt());

        Diagnostics.trigger('test_transaction', {
            timestamp: transaction.getTimestamp(),
            productId: transaction.getProductId(),
            amount: transaction.getAmount(),
            currency: transaction.getCurrency(),
            receipt: transaction.getReceipt()
        });
    }
}
