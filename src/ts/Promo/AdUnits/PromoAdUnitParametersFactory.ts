import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { IPromoAdUnitParameters } from 'Promo/AdUnits/PromoAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Promo } from 'Promo/Views/Promo';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';

export class PromoAdUnitParametersFactory extends AbstractAdUnitParametersFactory<PromoCampaign, IPromoAdUnitParameters> {
    private _purchasing: IPurchasingApi;

    constructor(purchasing: IPurchasingApi, core: ICore, ads: IAds) {
        super(core, ads);
        this._purchasing = purchasing;
    }

    protected createParameters(baseParams: IAdUnitParameters<PromoCampaign>) {
        const privacy = this.createPrivacy(baseParams);
        const showGDPRBanner = this.showGDPRBanner(baseParams);

        const view = new Promo(baseParams.platform, baseParams.core, baseParams.campaign, baseParams.deviceInfo.getLanguage(), privacy, showGDPRBanner, baseParams.placement);
        return {
            ... baseParams,
            purchasing: this._purchasing,
            view,
            privacy
        };
    }
}
