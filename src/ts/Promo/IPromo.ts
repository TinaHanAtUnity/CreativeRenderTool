import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';
import { PurchasingApi } from './Native/Purchasing';

export interface IPromoApi extends IModuleApi {
    Purchasing: PurchasingApi;
}

export interface IPromo extends IApiModule {
    readonly Api: Readonly<IPromoApi>;
}
