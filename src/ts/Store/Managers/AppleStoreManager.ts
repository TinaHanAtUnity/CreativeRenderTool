import { Core } from 'Core/Core';
import { StoreManager } from 'Store/Managers/StoreManager';

export class AppleStoreManager extends StoreManager {
    private _core: Core;

    constructor(core: Core) {
        super();
        this._core = core;
    }

    public startTracking(): void {
        // todo: implement method
    }
}
