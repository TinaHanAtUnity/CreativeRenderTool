import { NativeApi } from 'Core/Native/Bridge/NativeApi';

export interface IApi {
    [key: string]: NativeApi;
}

export interface IModuleApi {
    [key: string]: NativeApi | IApi | undefined;
    Android?: IApi;
    iOS?: IApi;
}

export interface IApiModule<T extends IModuleApi> {
    Api: T;
}
