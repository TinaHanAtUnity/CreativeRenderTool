import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class PerformanceVideoEventHandlers {

    public static onVideoCompleted(adUnit: PerformanceAdUnit) {
        const overlay = adUnit.getOverlay();

        if (typeof overlay !== "undefined" && (overlay.getABGroup() === 9 || overlay.getABGroup() === 10) && overlay.getClickedState()) {
            /* Add .then() to comfort test not sure why...
            * “before each” hook for “should include all operational events on Android”:
            * Error: Timeout of 2000ms exceeded. For async tests and hooks, ensure “done()” is called; if returning a Promise, ensure it resolves.
            * */
            adUnit.hide().then();
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
