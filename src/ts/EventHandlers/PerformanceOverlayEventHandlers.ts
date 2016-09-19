import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class PerformanceOverlayEventHandlers {

    public static onSkip(adUnit: PerformanceAdUnit) {
        adUnit.getEndScreen().show();
    }

}
