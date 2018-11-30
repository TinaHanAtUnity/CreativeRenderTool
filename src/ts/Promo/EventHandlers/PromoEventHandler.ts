import { GDPREventAction, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { FinishState } from 'Core/Constants/FinishState';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';

export class PromoEventHandler {

    public static onClose(adUnit: PromoAdUnit, campaign: PromoCampaign, placementId: string) {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.hide();
        PurchasingUtilities.onPromoClosed(adUnit.getThirdPartyEventManager(), campaign, placementId);
    }

    public static onPromoClick(adUnit: PromoAdUnit, campaign: PromoCampaign, placementId: string) {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.sendClick();
        adUnit.hide();
        PurchasingUtilities.onPurchase(adUnit.getThirdPartyEventManager(), campaign.getIapProductId(), campaign, placementId);
    }

    public static onGDPRPopupSkipped(configuration: AdsConfiguration, privacyManager: UserPrivacyManager): void {
        if (!configuration.isOptOutRecorded()) {
            configuration.setOptOutRecorded(true);
            privacyManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
