import { PerformanceAdUnit } from '../AdUnits/PerformanceAdUnit';

export class PerformanceVideoEventHandlers {

    public static onVideoCompleted(adUnit: PerformanceAdUnit) {
        adUnit.getEndScreen().show();
    }

    public static handleVideoError(adUnit: PerformanceAdUnit) {
        adUnit.getEndScreen().show();
    }

}
