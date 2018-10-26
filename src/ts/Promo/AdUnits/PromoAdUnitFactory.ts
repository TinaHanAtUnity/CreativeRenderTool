import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { Privacy } from 'Ads/Views/Privacy';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoEventHandler } from 'Promo/EventHandlers/PromoEventHandler';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { Promo } from 'Promo/Views/Promo';

export class PromoAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<PromoCampaign>): PromoAdUnit {
        const privacy = this.createPrivacy(parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);

        const promoView = new Promo(parameters.platform, parameters.core, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner, parameters.placement);
        const promoAdUnit = new PromoAdUnit({
            ...parameters,
            view: promoView,
            privacy: privacy,
            purchasing: parameters.purchasing!
        });

        promoView.render();
        document.body.appendChild(promoView.container());

        promoView.onGDPRPopupSkipped.subscribe(() => PromoEventHandler.onGDPRPopupSkipped(parameters.adsConfig, parameters.gdprManager));
        promoView.onClose.subscribe(() => PromoEventHandler.onClose(promoAdUnit, parameters.campaign, parameters.placement.getId()));
        Privacy.setupReportListener(privacy, promoAdUnit);

        return promoAdUnit;
    }

}
