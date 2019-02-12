import { StoreManager } from 'Store/Managers/StoreManager';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';

export class AppleStoreManager extends StoreManager {
    constructor(core: ICore, store: IStoreApi) {
        super(core, store);
    }

    public startTracking(): void {
        this._store.iOS!.Products.onTransaction.subscribe((data: unknown) => this.onTransaction(data));

        this._store.iOS!.Products.startTransactionObserver();
    }

    private onTransaction(data: unknown): void {
        this._core.Api.Sdk.logInfo('IOS TRANSACTION: ' + JSON.stringify(data));
    }
}
