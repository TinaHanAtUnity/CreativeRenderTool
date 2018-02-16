import { NativeBridge } from 'Native/NativeBridge';
import { PromoAdUnit } from 'AdUnits/PromoAdUnit';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

export class PromoEventHandler {

    public static onClose(nativeBridge: NativeBridge, adUnit: PromoAdUnit, gamerId: string, gameId: string, abGroup: number, purchaseTrackingUrls: string[], request: string): void {
        adUnit.hide();
        const iapPayload = {
            gamerId: gamerId,
            iapPromo: true,
            gameId: gameId,
            abGroup: abGroup,
            request: request,
            purchaseTrackingUrls: purchaseTrackingUrls,
        };
        PurchasingUtilities.initiatePurchaseRequest(nativeBridge, JSON.stringify(iapPayload));
    }

    public static onPromo(nativeBridge: NativeBridge, adUnit: PromoAdUnit, iapProductId: string, purchaseTrackingUrls: string[], request: string): void {
        adUnit.hide();
        adUnit.sendClick();
        const iapPayload = {
            productId: iapProductId,
            iapPromo: true,
            request: request,
            purchaseTrackingUrls: purchaseTrackingUrls,
        };
        PurchasingUtilities.initiatePurchaseRequest(nativeBridge, JSON.stringify(iapPayload));
    }
}
