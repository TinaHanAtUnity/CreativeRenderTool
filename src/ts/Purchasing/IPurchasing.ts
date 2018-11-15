import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';

export interface IPurchasingApi extends IModuleApi {
    CustomPurchasing: CustomPurchasingApi;
}

export interface IPurchasing extends IApiModule {
    readonly Api: Readonly<IPurchasingApi>;
}
