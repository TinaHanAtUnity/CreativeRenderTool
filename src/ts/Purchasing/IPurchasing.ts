import { CustomPurchasingApi } from './Native/CustomPurchasing';
import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';

export interface IPurchasingApi extends IModuleApi {
    CustomPurchasing: CustomPurchasingApi;
}

export interface IPurchasing extends IApiModule {
    readonly Api: Readonly<IPurchasingApi>;
}
