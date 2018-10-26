import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { PromoCampaign } from '../Models/PromoCampaign';
import { PromoAdUnit } from './PromoAdUnit';
import { Promo } from '../Views/Promo';
import { PromoEventHandler } from '../EventHandlers/PromoEventHandler';
import { Privacy } from 'Ads/Views/Privacy';

export class PromoAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<PromoCampaign>): PromoAdUnit {
        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);

        const promoView = new Promo(nativeBridge, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner, parameters.placement);
        const promoAdUnit = new PromoAdUnit(nativeBridge, {
            ...parameters,
            view: promoView,
            privacy: privacy
        });

        promoView.render();
        document.body.appendChild(promoView.container());

        promoView.onGDPRPopupSkipped.subscribe(() => PromoEventHandler.onGDPRPopupSkipped(parameters.adsConfig, parameters.gdprManager));
        promoView.onClose.subscribe(() => PromoEventHandler.onClose(promoAdUnit, parameters.campaign, parameters.placement.getId()));
        promoView.onPromo.subscribe((productId) => PromoEventHandler.onPromoClick(promoAdUnit, parameters.campaign, parameters.placement.getId()));
        Privacy.setupReportListener(privacy, promoAdUnit);

        return promoAdUnit;
    }

}
