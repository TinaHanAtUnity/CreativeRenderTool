import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { FinishState } from 'Core/Constants/FinishState';
import { ABGroup } from 'Core/Models/ABGroup';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { IPromoPayload, IPromoRequest, PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';

export class PromoEventHandler {

    public static onClose(adUnit: PromoAdUnit, campaign: PromoCampaign, placementId: string) {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.hide();
        PurchasingUtilities.onPromoClosed(campaign, placementId);
    }

    public static onPromoClick(adUnit: PromoAdUnit, campaign: PromoCampaign, placementId: string) {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.sendClick();
        adUnit.hide();
        PurchasingUtilities.onPurchase(campaign.getIapProductId(), campaign, placementId);
    }

    public static onGDPRPopupSkipped(configuration: AdsConfiguration, gdprManager: GdprManager): void {
        if (!configuration.isOptOutRecorded()) {
            configuration.setOptOutRecorded(true);
            gdprManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
