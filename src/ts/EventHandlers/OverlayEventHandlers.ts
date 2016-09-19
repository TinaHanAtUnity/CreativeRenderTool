import { Double } from 'Utilities/Double';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class OverlayEventHandlers {

    public static onSkip(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit): void {
        nativeBridge.VideoPlayer.pause();
        videoAdUnit.setVideoActive(false);
        videoAdUnit.setFinishState(FinishState.SKIPPED);
        sessionManager.sendSkip(adUnit, videoAdUnit.getVideoPosition());

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

        videoAdUnit.getOverlay().hide();
        this.afterSkip(videoAdUnit);
    }

    protected static afterSkip(videoAdUnit: VideoAdUnit) {
        videoAdUnit.onFinish.trigger();
    };

    public static onMute(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, muted: boolean): void {
        nativeBridge.VideoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
        sessionManager.sendMute(adUnit, sessionManager.getSession(), muted);
    }

    public static onCallButton(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit): void {
        let clickThroughURL = adUnit.getVideoClickThroughURL();
        sessionManager.sendVideoClickTracking(adUnit, sessionManager.getSession());

        if (nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.UrlScheme.open(clickThroughURL);
        } else {
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': clickThroughURL
            });
        }
    }
}
