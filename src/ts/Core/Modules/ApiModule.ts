import { NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export interface IApi {
    [key: string]: NativeApi;
}

export interface IModuleApi {
    [key: string]: NativeApi | IApi | undefined;
    Android?: IApi;
    iOS?: IApi;
}

export interface IApiModule<T extends IModuleApi> {
    readonly Api: T;
    load(nativeBridge: NativeBridge): IModuleApi;
}
