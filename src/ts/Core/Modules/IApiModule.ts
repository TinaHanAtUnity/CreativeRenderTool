import { IModule } from 'Core/Modules/IModule';
import { NativeApi } from 'Core/Native/Bridge/NativeApi';

export interface IModuleApi {
    readonly [key: string]: NativeApi;
}

export interface IApiModule<T extends IModuleApi> extends IModule {
    readonly Api: T;
}
