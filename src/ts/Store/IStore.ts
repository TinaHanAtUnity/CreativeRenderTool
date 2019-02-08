import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { StoreManager } from 'Store/Managers/StoreManager';
import { ProductsApi } from 'Store/Native/iOS/Products';

export interface IStoreApi extends IModuleApi {
    Android?: {
        Store: AndroidStoreApi;
    };
    iOS?: {
        Products: ProductsApi;
    };
}

export interface IStore extends IApiModule {
    readonly Api: Readonly<IStoreApi>;
    readonly StoreManager: StoreManager;
}
