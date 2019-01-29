import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { PromoAdUnit, IPromoAdUnitParameters } from 'Promo/AdUnits/PromoAdUnit';
import { PromoEventHandler } from 'Promo/EventHandlers/PromoEventHandler';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';

export class PromoAdUnitFactory extends AbstractAdUnitFactory<PromoCampaign, IPromoAdUnitParameters> {

    public createAdUnit(parameters: IPromoAdUnitParameters): PromoAdUnit {
        const promoAdUnit = new PromoAdUnit(parameters);

        parameters.view.render();
        document.body.appendChild(parameters.view.container());

        parameters.view.onGDPRPopupSkipped.subscribe(() => PromoEventHandler.onGDPRPopupSkipped(parameters.adsConfig, parameters.privacyManager));
        parameters.view.onClose.subscribe(() => PromoEventHandler.onClose(promoAdUnit, parameters.campaign, parameters.placement.getId()));
        parameters.view.onPromo.subscribe((productId) => PromoEventHandler.onPromoClick(promoAdUnit, parameters.campaign, parameters.placement.getId()));

        return promoAdUnit;
    }

}
