import { SplitScreen }  from 'Views/SplitScreen';
import { SplitScreenAdUnit } from 'AdUnits/SplitScreenAdUnit';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { ViewConfiguration } from 'AdUnits/Containers/ViewConfiguration';
import { NativeBridge } from 'Native/NativeBridge';
import { FinishState } from 'Constants/FinishState';
import { SessionManager } from 'Managers/SessionManager';

export class SplitScreenEventHandlers {

    public static onFullScreenButton(adUnitContainer: AdUnitContainer, endScreen: SplitScreen): void {
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

    public static onVideoCompleted(adUnitContainer: AdUnitContainer, adUnit: SplitScreenAdUnit): void {
        const endScreen = adUnit.getSplitVideoEndScreen();
        if(endScreen) {
            if(endScreen!.isFullScreenVideo()) {
                adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                    endScreen.showEndScreen();
                });
            } else {
                endScreen.showEndScreen();
            }
        }
    }

    public static onError(adUnitContainer: AdUnitContainer, adUnit: SplitScreenAdUnit): void {
        const endScreen = adUnit.getSplitVideoEndScreen();
        if(endScreen) {
            if(endScreen!.isFullScreenVideo()) {
                adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                    endScreen.showEndScreen();
                });
            } else {
                endScreen.showEndScreen();
            }
        }
    }

    public static onSkip(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnitContainer: AdUnitContainer, adUnit: SplitScreenAdUnit) {
        nativeBridge.VideoPlayer.pause();
        adUnit.getVideo().setActive(false);
        adUnit.setFinishState(FinishState.SKIPPED);
        sessionManager.sendSkip(adUnit, adUnit.getVideo().getPosition());

        const overlay = adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }

        if(adUnit.getSplitVideoEndScreen()) {
            adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN).then(() => {
                adUnit.getSplitVideoEndScreen()!.showEndScreen();
            });
        }
        adUnit.onFinish.trigger();
    }

    public static onPrepared(adUnitContainer: AdUnitContainer, adUnit: SplitScreenAdUnit) {
        const endScreen = adUnit.getSplitVideoEndScreen();
        if(endScreen) {
            endScreen.getOverlay().setFullScreenButtonVisible(true);
            if(!endScreen.isFullScreenVideo()) {
                adUnitContainer.reconfigure(ViewConfiguration.CONFIGURATION_SPLIT_VIDEO_ENDSCREEN);
            }
        }
    }
}
