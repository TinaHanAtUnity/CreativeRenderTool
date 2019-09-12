import { IStore, IStoreApi } from 'Store/IStore';
import { StoreManager } from 'Store/Managers/StoreManager';
import { IApiModule } from 'Core/Modules/IApiModule';
import { ICore } from 'Core/ICore';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { Platform } from 'Core/Constants/Platform';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { NullStoreManager } from 'Store/Managers/NullStoreManager';

export class Store implements IStore, IApiModule {
    public readonly Api: Readonly<IStoreApi>;
    public StoreManager: StoreManager;

    constructor(core: ICore, analyticsManager: IAnalyticsManager) {

        this.Api = {
            Android: core.NativeBridge.getPlatform() === Platform.ANDROID ? {
                Store: new AndroidStoreApi(core.NativeBridge)
            } : undefined,
            iOS: core.NativeBridge.getPlatform() === Platform.IOS ? {
                Products: new ProductsApi(core.NativeBridge),
                AppSheet: new AppSheetApi(core.NativeBridge)
            } : undefined
        };

        if (core.NativeBridge.getPlatform() === Platform.ANDROID) {
            this.StoreManager = new GoogleStoreManager(this.Api, analyticsManager);
        } else if (core.NativeBridge.getPlatform() === Platform.IOS) {
            this.StoreManager = new AppleStoreManager(this.Api, analyticsManager);
        } else {
            this.StoreManager = new NullStoreManager(this.Api, analyticsManager);
        }
    }
}
