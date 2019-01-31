import { StoreManager } from 'Store/Managers/StoreManager';
import { Core } from 'Core/Core';

export class GoogleStoreManager extends StoreManager {
    private _core: Core;

    constructor(core: Core) {
        super();
        this._core = core;
    }

    public startTracking(): void {
        // todo: implement method
    }
}
