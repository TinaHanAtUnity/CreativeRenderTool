import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class PerformanceOverlayEventHandlers {

    public static onSkip(adUnit: PerformanceAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        adUnit.onFinish.trigger();
    }

}
