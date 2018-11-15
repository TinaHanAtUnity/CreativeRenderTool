import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';

export interface IPromoApi extends IModuleApi {
    Purchasing: PurchasingApi;
}

export interface IPromo extends IApiModule {
    readonly Api: Readonly<IPromoApi>;
    readonly PromoEvents: PromoEvents;
}
