import { StoreManager } from 'Store/Managers/StoreManager';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';

export class AppleStoreManager extends StoreManager {
    private _core: ICore;
    private _store: IStoreApi;

    constructor(core: ICore, store: IStoreApi) {
        super();
        this._core = core;
        this._store = store;
    }

    public startTracking(): void {
        this._store.iOS!.Store.onTransaction.subscribe((data: any) => this.onTransaction(data));

        this._store.iOS!.Store.startTransactionObserver();
    }

    private onTransaction(data: any): void {
        this._core.Api.Sdk.logInfo('IOS TRANSACTION: ' + JSON.stringify(data));
    }
}
