import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Overlay } from 'Views/Overlay';

export class PerformanceVideoEventHandlers {

    public static onVideoCompleted(adUnit: PerformanceAdUnit) {
        const overlay = adUnit.getOverlay();

        if (overlay && overlay instanceof Overlay && overlay.getClickedState() && (overlay.getAbGroup() === 8 || overlay.getAbGroup() === 10)) {
            adUnit.hide();
        } else {
            const endScreen = adUnit.getEndScreen();

            if (endScreen) {
                endScreen.show();
            }
        }
    }

    public static onVideoError(adUnit: PerformanceAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }

}
