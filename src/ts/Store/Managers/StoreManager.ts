import { StoreTransaction } from 'Store/Models/StoreTransaction';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';

export abstract class StoreManager {
    protected _core: ICore;
    protected _store: IStoreApi;

    constructor(core: ICore, store: IStoreApi) {
        this._core = core;
        this._store = store;
    }

    public abstract startTracking(): void;

    public sendTransaction(transaction: StoreTransaction) {
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
