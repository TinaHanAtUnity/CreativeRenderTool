import { SplitScreenAdUnit } from 'AdUnits/SplitScreenAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';

export class SplitScreenVideoEventHandlers extends VideoEventHandlers {

    protected static afterVideoCompleted(adUnit: VideoAdUnit) {
        const endScreen = (<SplitScreenAdUnit>adUnit).getSplitVideoEndScreen();
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

    protected static updateViewsOnVideoError(adUnit: VideoAdUnit) {
        const endScreen = (<SplitScreenAdUnit>adUnit).getSplitVideoEndScreen();
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
