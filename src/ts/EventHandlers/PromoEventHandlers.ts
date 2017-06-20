import { NativeBridge } from 'Native/NativeBridge';
import { PromoAdUnit}  from 'AdUnits/PromoAdUnit';

export class PromoEventHandlers {

    public static onClose(adUnit: PromoAdUnit): void {
        adUnit.hide();
    }

    public static onPromo(nativeBridge: NativeBridge, adUnit: PromoAdUnit, iapProductId: string): void {
        adUnit.hide();
        const iapPayload = <any>{};
        iapPayload.productId = iapProductId;
        nativeBridge.Listener.sendInitiatePurchaseEvent(JSON.stringify(iapPayload));
    }

}
