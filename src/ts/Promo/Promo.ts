import { Ads, AdsModule } from '../Ads/Ads';
import { IApiModule, IModuleApi } from '../Core/Modules/ApiModule';
import { PurchasingApi } from './Native/Purchasing';
import { PurchasingUtilities } from './Utilities/PurchasingUtilities';

export interface IPromoApi extends IModuleApi {
    Purchasing: PurchasingApi;
}

export class Promo extends AdsModule implements IApiModule {

    public readonly Api: IPromoApi;

    constructor(ads: Ads) {
        super(ads);

        this.Api = {
            Purchasing: new PurchasingApi(this.Core.NativeBridge)
        };
    }

    public initialize(): Promise<void> {
        PurchasingUtilities.initialize(this);
        PurchasingUtilities.sendPurchaseInitializationEvent();
        this.Api.Purchasing.onIAPSendEvent.subscribe((iapPayload) => PurchasingUtilities.handleSendIAPEvent(iapPayload));
    }

}
