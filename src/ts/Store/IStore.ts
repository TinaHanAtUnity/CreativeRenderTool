import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { StoreManager } from 'Store/Managers/StoreManager';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';

export interface IStoreApi extends IModuleApi {
    Android?: {
        Store: AndroidStoreApi;
    };
    iOS?: {
        Products: ProductsApi;
        AppSheet: AppSheetApi;
    };
}

export interface IStore extends IApiModule {
    readonly Api: Readonly<IStoreApi>;
    readonly StoreManager: StoreManager;
}
