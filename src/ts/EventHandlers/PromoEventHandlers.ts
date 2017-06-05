import { NativeBridge } from 'Native/NativeBridge';
import { PromoAdUnit}  from 'AdUnits/PromoAdUnit';

export class PromoEventHandlers {

    public static onClose(adUnit: PromoAdUnit): void {
        adUnit.hide();
    }

    public static onPromo(nativeBridge: NativeBridge, iapProductId: string): void {
        nativeBridge.Listener.sendInitiatePurchaseEvent(iapProductId);
    }

}
