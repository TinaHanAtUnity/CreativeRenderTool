import { Ads, AdsModule } from '../Ads/Ads';
import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';
import { PurchasingApi } from './Native/Purchasing';
import { PurchasingUtilities } from './Utilities/PurchasingUtilities';

export interface IPromoApi extends IModuleApi {
    Purchasing: PurchasingApi;
}

export class Promo extends AdsModule implements IApiModule {

    public readonly Api: IPromoApi;

    private _initialized = false;

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
        this._initialized = true;
    }

    public isInitialized() {
        return this._initialized;
    }

}
