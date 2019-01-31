import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { IosStoreApi } from 'Store/Native/iOS/Store';

export interface IStoreApi extends IModuleApi {
    Android?: {
        Store: AndroidStoreApi;
    };
    iOS?: {
        Store: IosStoreApi;
    };
}

export interface IStore extends IApiModule {
    readonly Api: Readonly<IStoreApi>;
}
