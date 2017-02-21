import { SplitScreenAdUnit } from 'AdUnits/SplitScreenAdUnit';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';

export class SplitScreenVideoEventHandlers extends VideoEventHandlers {

    public static afterVideoCompleted(adUnit: SplitScreenAdUnit) {
        const endScreen = adUnit.getSplitVideoEndScreen();
        if(endScreen) {
            if(endScreen!.isFullScreenVideo()) {
                adUnit.getContainer().reconfigure(ViewConfiguration.SPLIT_VIDEO_ENDSCREEN).then(() => {
                    endScreen.showEndScreen();
                });
            } else {
                endScreen.showEndScreen();
            }
        }

        const overlay = adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        adUnit.onFinish.trigger();
    }

    public static updateViewsOnVideoError(adUnit: SplitScreenAdUnit) {
        const endScreen = adUnit.getSplitVideoEndScreen();
        if(endScreen) {
            if(endScreen!.isFullScreenVideo()) {
                adUnit.getContainer().reconfigure(ViewConfiguration.SPLIT_VIDEO_ENDSCREEN).then(() => {
                    endScreen.showEndScreen();
                });
            } else {
                endScreen.showEndScreen();
            }
        }
    }
}
