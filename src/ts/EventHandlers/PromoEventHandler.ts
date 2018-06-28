import { PromoAdUnit } from 'AdUnits/PromoAdUnit';
import { PurchasingUtilities, IPromoPayload, IPromoRequest } from 'Utilities/PurchasingUtilities';
import { Configuration } from 'Models/Configuration';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { ABGroup } from 'Models/ABGroup';
import { GdprManager, GDPREventAction } from 'Managers/GdprManager';

export class PromoEventHandler {

    public static onClose(adUnit: PromoAdUnit, gamerToken: string, gameId: string, abGroup: ABGroup, purchaseTrackingUrls: string[], isOptOutEnabled: boolean): void {
        adUnit.setFinishState(FinishState.SKIPPED);
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
        PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayload));
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
        PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayload));
    }

    public static onGDPRPopupSkipped(configuration: Configuration, gdprManager: GdprManager): void {
        if (!configuration.isOptOutRecorded()) {
            configuration.setOptOutRecorded(true);
            gdprManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
