import { IModule } from 'Core/Modules/IModule';
import { NativeApi } from 'Core/Native/Bridge/NativeApi';

export interface IModuleApi {
    readonly [key: string]: NativeApi | IModuleApi | undefined;
    readonly Android?: IModuleApi;
    readonly iOS?: IModuleApi;
}

export interface IAPIModule extends IModule {
    readonly Api: IModuleApi;
}
