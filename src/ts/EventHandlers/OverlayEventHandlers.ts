import { Double } from 'Utilities/Double';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class OverlayEventHandlers {

    public static onSkip(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        nativeBridge.VideoPlayer.pause();
        adUnit.getVideoAdUnitController().setVideoActive(false);
        adUnit.getVideoAdUnitController().setFinishState(FinishState.SKIPPED);
        sessionManager.sendSkip(adUnit, adUnit.getVideoAdUnitController().getVideoPosition());

        if (nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
        }

        const overlay = adUnit.getVideoAdUnitController().getOverlay();
        if (overlay) {
            overlay.hide();
        }

        adUnit.getVideoAdUnitController().onVideoFinish.trigger();
    }

    public static onMute(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, muted: boolean): void {
        nativeBridge.VideoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
        sessionManager.sendMute(adUnit, sessionManager.getSession(), muted);
    }

    public static onCallButton(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit): void {
        sessionManager.sendVideoClickTracking(adUnit, sessionManager.getSession());

        let clickThroughURL = adUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            if(nativeBridge.getPlatform() === Platform.IOS) {
                nativeBridge.UrlScheme.open(clickThroughURL);
            } else {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': clickThroughURL
                });
            }
        }
    }
}
