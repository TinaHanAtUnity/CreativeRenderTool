import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number): void {
        let overlay = adUnit.getOverlay();

        overlay.setVideoDuration(duration);
        overlay.setSpinner(true);

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

    public static onVideoProgress(adUnit: VideoAdUnit, position: number): void {
        if(position - adUnit.getVideoPosition() < 100) {
            adUnit.getOverlay().setSpinner(true);
        } else {
            adUnit.getOverlay().setSpinner(false);
        }

        if(position > 0) {
            adUnit.setVideoPosition(position);
        }
        adUnit.getOverlay().setVideoProgress(position);
    }

    public static onVideoStart(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        sessionManager.sendStart(adUnit);

        adUnit.getOverlay().setSpinner(false);
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

        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
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
}
