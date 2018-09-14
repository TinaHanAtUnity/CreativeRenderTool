import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { FinishState } from 'Core/Constants/FinishState';
import { ABGroup } from 'Core/Models/ABGroup';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { IPromoPayload, IPromoRequest, PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { AdsConfiguration } from '../../Ads/Models/AdsConfiguration';

export class PromoEventHandler {

    public static onClose(adUnit: PromoAdUnit, gamerToken: string, gameId: string, abGroup: ABGroup, purchaseTrackingUrls: string[], isOptOutEnabled: boolean): void {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.hide();
        const iapPayload: IPromoPayload = {
            gamerToken: gamerToken,
            trackingOptOut: isOptOutEnabled,
            iapPromo: true,
            gameId: gameId + '|' + gamerToken,
            abGroup: abGroup.toNumber(),
            request: IPromoRequest.CLOSE,
            purchaseTrackingUrls: purchaseTrackingUrls
        };
        PurchasingUtilities.sendPromoPayload(iapPayload);
    }

    public static onPromo(adUnit: PromoAdUnit, iapProductId: string, purchaseTrackingUrls: string[]): void {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.hide();
        adUnit.sendClick();
        const iapPayload: IPromoPayload = {
            productId: iapProductId,
            iapPromo: true,
            request: IPromoRequest.PURCHASE,
            purchaseTrackingUrls: purchaseTrackingUrls
        };
        PurchasingUtilities.sendPromoPayload(iapPayload);
    }

    public static onGDPRPopupSkipped(configuration: AdsConfiguration, gdprManager: GdprManager): void {
        if (!configuration.isOptOutRecorded()) {
            configuration.setOptOutRecorded(true);
            gdprManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
