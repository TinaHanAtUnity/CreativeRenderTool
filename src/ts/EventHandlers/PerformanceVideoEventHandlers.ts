import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Overlay } from 'Views/Overlay';

export class PerformanceVideoEventHandlers {

    public static onVideoCompleted(adUnit: PerformanceAdUnit) {
        const overlay = adUnit.getOverlay();

        if (overlay && overlay instanceof Overlay && overlay.getClickedState() && (overlay.getAbGroup() === 8 || overlay.getAbGroup() === 10)) {
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
