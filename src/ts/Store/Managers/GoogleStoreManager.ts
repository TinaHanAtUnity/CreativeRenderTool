import { StoreManager } from 'Store/Managers/StoreManager';
import { ICore } from 'Core/ICore';
import { IStoreApi } from 'Store/IStore';

export class GoogleStoreManager extends StoreManager {
    constructor(core: ICore, store: IStoreApi) {
        super(core, store);
    }

    public startTracking(): void {
        this._store.Android!.Store.onInitialized.subscribe(() => this.onInitialized());
        this._store.Android!.Store.onBillingStart.subscribe((data: unknown) => this.onBillingStart(data));
        this._store.Android!.Store.onBillingEnd.subscribe((data: unknown) => this.onBillingEnd(data));

        this._store.Android!.Store.initialize();
    }

    private onInitialized() {
        this._store.Android!.Store.setListenerState(true);
    }

    private onBillingStart(data: unknown) {
        this._core.Api.Sdk.logInfo('GOOGLE BILLING START: ' + JSON.stringify(data));
        // todo: implement logic
    }

    private onBillingEnd(data: unknown) {
        this._core.Api.Sdk.logInfo('GOOGLE BILLING END: ' + JSON.stringify(data));
    }
}
