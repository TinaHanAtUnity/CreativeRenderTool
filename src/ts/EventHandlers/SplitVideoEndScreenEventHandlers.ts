import { SplitVideoEndScreen }  from 'Views/SplitVideoEndScreen';
import { SplitVideoEndScreenAdUnit } from 'AdUnits/SplitVideoEndScreenAdUnit';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { ViewConfiguration } from 'AdUnits/Containers/ViewConfiguration';

export class SplitVideoEndScreenEventHandlers {

    public static onFullScreenButton(adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen): void {
        if (!endScreen.isFullScreenVideo()) {
            endScreen!.setFullScreenVideo(true);
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_LANDSCAPE_VIDEO).then(() => {
                //
            });
        } else {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                endScreen.setFullScreenVideo(false);
            });
        }
    }

    public static onVideoCompleted(adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen): void {
        if(endScreen!.isFullScreenVideo()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                endScreen.showEndScreen();
            });
        } else {
            endScreen.showEndScreen();
        }
    }

    public static onVideoError(adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen): void {
        if(endScreen!.isFullScreenVideo()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                endScreen.showEndScreen();
            });
        } else {
            endScreen.showEndScreen();
        }
    }

    public static onSkip(adUnitContainer: AdUnitContainer, adUnit: SplitVideoEndScreenAdUnit) {
        if(adUnit.getSplitVideoEndScreen()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                adUnit.getSplitVideoEndScreen()!.showEndScreen();
            });
        }
        adUnit.onFinish.trigger();
    }

    public static onVideoPrepared(adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen) {
        endScreen.getOverlay().setFullScreenButtonVisible(true);
        if(!endScreen.isFullScreenVideo()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN);
        }
    }
}
