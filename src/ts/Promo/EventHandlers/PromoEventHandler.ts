import { GDPREventAction, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { FinishState } from 'Core/Constants/FinishState';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export class PromoEventHandler {

    public static onClose(adUnit: PromoAdUnit, campaign: PromoCampaign, placementId: string) {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.hide();
        PurchasingUtilities.onPromoClosed(adUnit.getThirdPartyEventManager(), campaign, placementId);
    }

    public static onPromoClick(adUnit: PromoAdUnit, campaign: PromoCampaign) {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.sendClick();
        adUnit.hide();
        PurchasingUtilities.onPurchase(adUnit.getThirdPartyEventManager(), campaign.getIapProductId(), campaign);
    }

    public static onGDPRPopupSkipped(privacySDK: PrivacySDK, privacyManager: UserPrivacyManager): void {
        if (!privacySDK.isOptOutRecorded()) {
            privacySDK.setOptOutRecorded(true);
            privacyManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
