import { IStore, IStoreApi } from 'Store/IStore';
import { StoreManager } from 'Store/Managers/StoreManager';
import { IApiModule } from 'Core/Modules/IApiModule';
import { ICore } from 'Core/ICore';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { IosStoreApi } from 'Store/Native/iOS/Store';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { Platform } from 'Core/Constants/Platform';

export class Store implements IStore, IApiModule {
    public readonly Api: Readonly<IStoreApi>;
    public StoreManager: StoreManager;

    private _core: ICore;

    constructor(core: ICore) {
        this._core = core;

        this.Api = {
            Android: core.NativeBridge.getPlatform() === Platform.ANDROID ? {
                Store: new AndroidStoreApi(core.NativeBridge)
            } : undefined,
            iOS: core.NativeBridge.getPlatform() === Platform.IOS ? {
                Store: new IosStoreApi(core.NativeBridge)
            } : undefined
        };

        if(core.NativeBridge.getPlatform() === Platform.ANDROID) {
            this.StoreManager = new GoogleStoreManager(core, this.Api);
        } else {
            this.StoreManager = new AppleStoreManager(core, this.Api);
        }
    }
}
