import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class PerformanceVideoEventHandlers {

    public static onVideoCompleted(adUnit: PerformanceAdUnit) {
        const overlay = adUnit.getOverlay();

        if (typeof overlay !== "undefined" && (overlay.getABGroup() === 9 || overlay.getABGroup() === 10) && overlay.getClickedState()) {
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
