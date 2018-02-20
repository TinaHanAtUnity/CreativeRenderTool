import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Overlay } from 'Views/Overlay';

export class PerformanceVideoEventHandlers {

    public static onVideoCompleted(adUnit: PerformanceAdUnit) {
        const endScreen = adUnit.getEndScreen();

        if (endScreen) {
            endScreen.show();
        }
    }

    public static onVideoError(adUnit: PerformanceAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }

}
