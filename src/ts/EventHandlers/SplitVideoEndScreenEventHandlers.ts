import { DeviceInfo } from 'Models/DeviceInfo';
import { SplitVideoEndScreen }  from 'Views/SplitVideoEndScreen';
import { SplitVideoEndScreenAdUnit } from 'AdUnits/SplitVideoEndScreenAdUnit';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { ViewConfiguration } from 'AdUnits/Containers/ViewConfiguration';

export class SplitVideoEndScreenEventHandlers {

    public static onFullScreenButton(deviceInfo: DeviceInfo, adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen): void {
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

    public static onVideoCompleted(deviceInfo: DeviceInfo, adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen): void {
        if(endScreen!.isFullScreenVideo()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                endScreen.setFullScreenVideo(false);
                endScreen.setCloseElementVisibility(true);
            });
        } else {
            endScreen.setCloseElementVisibility(true);
        }
    }

    public static onVideoError(deviceInfo: DeviceInfo, adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen): void {
        if(endScreen!.isFullScreenVideo()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                endScreen.setFullScreenVideo(false);
                endScreen.setCloseElementVisibility(true);
            });
        } else {
            endScreen.setCloseElementVisibility(true);
        }
    }

    public static onSkip(deviceInfo: DeviceInfo, adUnitContainer: AdUnitContainer, adUnit: SplitVideoEndScreenAdUnit) {
        if(adUnit.getEndScreen()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                adUnit.getEndScreen()!.setFullScreenVideo(false);
                adUnit.getEndScreen()!.setCloseElementVisibility(true);
            });
        }
        adUnit.onFinish.trigger();
    }

    public static onVideoPrepared(deviceInfo: DeviceInfo, adUnitContainer: AdUnitContainer, endScreen: SplitVideoEndScreen) {
        endScreen.getOverlay().setFullScreenButtonVisible(true);
        if(!endScreen.isFullScreenVideo()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN);
        }
    }
}
