import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

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
