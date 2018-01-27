import { XPromoAdUnit } from 'AdUnits/XPromoAdUnit';

export class XPromoVideoEventHandlers {

    public static onVideoCompleted(adUnit: XPromoAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }

    public static onVideoError(adUnit: XPromoAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }

}
