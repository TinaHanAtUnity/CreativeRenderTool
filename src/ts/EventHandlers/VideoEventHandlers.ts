import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number): void {
        let overlay = adUnit.getOverlay();

        adUnit.setVideoDuration(duration);
        overlay.setVideoDuration(duration);
        if(adUnit.getPlacement().allowSkip()) {
            overlay.setSkipVisible(true);
        }
        overlay.setMuteEnabled(true);
        overlay.setVideoDurationEnabled(true);

        nativeBridge.VideoPlayer.setVolume(new Double(overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            if(adUnit.getVideoPosition() > 0) {
                nativeBridge.VideoPlayer.seekTo(adUnit.getVideoPosition()).then(() => {
                    nativeBridge.VideoPlayer.play();
                });
            } else {
                nativeBridge.VideoPlayer.play();
            }
        });
    }

    public static onVideoProgress(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, position: number): void {
        // todo: video progress event should be handled here and not delegated to session manager
        sessionManager.sendProgress(adUnit, sessionManager.getSession(), position, adUnit.getVideoPosition());

        if(position > 0) {
            let lastPosition = adUnit.getVideoPosition();
            if(lastPosition > 0 && position - lastPosition < 100) {
                adUnit.getOverlay().setSpinnerEnabled(true);
            } else {
                adUnit.getOverlay().setSpinnerEnabled(false);
            }

            let previousQuartile: number = adUnit.getVideoQuartile();
            adUnit.setVideoPosition(position);

            if(previousQuartile === 0 && adUnit.getVideoQuartile() === 1) {
                sessionManager.sendFirstQuartile(adUnit);
            } else if(previousQuartile === 1 && adUnit.getVideoQuartile() === 2) {
                sessionManager.sendMidpoint(adUnit);
            } else if(previousQuartile === 2 && adUnit.getVideoQuartile() === 3) {
                sessionManager.sendThirdQuartile(adUnit);
            }
        }

        adUnit.getOverlay().setVideoProgress(position);
    }

    public static onVideoStart(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        sessionManager.sendStart(adUnit);

        adUnit.getOverlay().setSpinnerEnabled(false);
        nativeBridge.VideoPlayer.setProgressEventInterval(250);

        if(adUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            nativeBridge.Listener.sendStartEvent(adUnit.getPlacement().getId());
        }

        adUnit.newWatch();
    }

    public static onVideoCompleted(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        sessionManager.sendView(adUnit);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        this.afterVideoCompleted(nativeBridge, adUnit);

        nativeBridge.Storage.get<boolean>(StorageType.PUBLIC, 'integration_test.value').then(integrationTest => {
            if(integrationTest) {
                if(nativeBridge.getPlatform() === Platform.ANDROID) {
                    nativeBridge.rawInvoke('com.unity3d.ads.test.integration.IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
                } else {
                    nativeBridge.rawInvoke('UADSIntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
                }
            }
        });
    }

    public static onVideoError(nativeBridge: NativeBridge, adUnit: VideoAdUnit, what: number, extra: number) {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.ERROR);

        nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.Sdk.logError('Unity Ads video player error');
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.Sdk.logError('Unity Ads video player error ' + what + ' ' + extra);
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
    }

    protected static afterVideoCompleted(nativeBridge: NativeBridge, adUnit: VideoAdUnit) {
        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
        }
    };
}
