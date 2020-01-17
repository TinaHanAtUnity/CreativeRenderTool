import { GDPREventAction, GDPREventSource, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { FinishState } from 'Core/Constants/FinishState';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacy } from 'Privacy/Privacy';

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
            // todo: add age gate choice
            const legalFramework = privacySDK.getLegalFramework();
            const permissions = legalFramework === LegalFramework.GDPR ? UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST_GDPR : UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST;
            privacyManager.updateUserPrivacy(permissions,
                GDPREventSource.USER_INDIRECT, GDPREventAction.PROMO_SKIPPED_BANNER);
        }
    }
}
