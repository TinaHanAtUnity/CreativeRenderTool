import { IModule } from 'Core/Modules/IModule';
import { NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Platform } from 'Core/Constants/Platform';

export interface IModuleApi {
    readonly [key: string]: NativeApi | Platform | IModuleApi;
}

export interface IAndroidModuleApi extends IModuleApi {
    readonly Platform: Platform.ANDROID;
    readonly Android: IModuleApi;
}

export interface IIosModuleApi extends IModuleApi {
    readonly Platform: Platform.IOS;
    readonly iOS: IModuleApi;
}

export interface IApiModule extends IModule {
    readonly Api: IAndroidModuleApi | IIosModuleApi;
}
