import { NativeBridge } from 'Native/NativeBridge';
import { PromoAdUnit } from 'AdUnits/PromoAdUnit';
import { PurchasingUtilities, IPromoPayload, IPromoRequest } from 'Utilities/PurchasingUtilities';
import { FinishState } from 'Constants/FinishState';

export class PromoEventHandler {

    public static onClose(nativeBridge: NativeBridge, adUnit: PromoAdUnit, gamerId: string, gameId: string, abGroup: number, purchaseTrackingUrls: string[]): void {
        adUnit.setFinishState(FinishState.SKIPPED);
        adUnit.hide();
        const iapPayload: IPromoPayload = {
            gamerId: gamerId,
            iapPromo: true,
            gameId: gameId,
            abGroup: abGroup,
            request: IPromoRequest.CLOSE,
            purchaseTrackingUrls: purchaseTrackingUrls,
        };
        PurchasingUtilities.beginPurchaseEvent(nativeBridge, JSON.stringify(iapPayload));
    }

    public static onPromo(nativeBridge: NativeBridge, adUnit: PromoAdUnit, iapProductId: string, purchaseTrackingUrls: string[]): void {
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.hide();
        adUnit.sendClick();
        const iapPayload: IPromoPayload = {
            productId: iapProductId,
            iapPromo: true,
            request: IPromoRequest.PURCHASE,
            purchaseTrackingUrls: purchaseTrackingUrls,
        };
        PurchasingUtilities.beginPurchaseEvent(nativeBridge, JSON.stringify(iapPayload));
    }
}
