import { PromoAdUnit } from 'AdUnits/PromoAdUnit';
import { PurchasingUtilities, IPromoPayload, IPromoRequest } from 'Utilities/PurchasingUtilities';
import { Configuration } from 'Models/Configuration';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

export class PromoEventHandler {

    public static onClose(adUnit: PromoAdUnit, gamerToken: string, gameId: string, abGroup: number, purchaseTrackingUrls: string[], isOptOutEnabled: boolean): void {
        adUnit.setFinishState(FinishState.SKIPPED);
        adUnit.hide();
        const iapPayload: IPromoPayload = {
            gamerToken: gamerToken,
            trackingOptOut: isOptOutEnabled,
            iapPromo: true,
            gameId: gameId + '|' + gamerToken,
            abGroup: abGroup,
            request: IPromoRequest.CLOSE,
            purchaseTrackingUrls: purchaseTrackingUrls,
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
            purchaseTrackingUrls: purchaseTrackingUrls,
        };
        PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayload));
    }

    public static onGDPRPopupSkipped(configuration: Configuration, operativeEventManager: OperativeEventManager): void {
        if (!configuration.isOptOutRecorded()) {
            configuration.setOptOutRecorded(true);
            operativeEventManager.sendGDPREvent('skip');
        }
    }
}
