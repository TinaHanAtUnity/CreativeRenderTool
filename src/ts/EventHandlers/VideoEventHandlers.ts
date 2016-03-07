import { VideoAdUnit } from 'Models/VideoAdUnit';
import { Double } from 'Utilities/Double';
import { FinishState } from 'Models/AdUnit';
import { StorageType } from 'Managers/StorageManager';

export class VideoEventHandlers {

    public static onVideoPrepared(adUnit: VideoAdUnit, duration: number, width: number, height: number): void {
        let videoPlayer = adUnit.getVideoPlayer();
        adUnit.getOverlay().setVideoDuration(duration);
        videoPlayer.setVolume(new Double(adUnit.getOverlay().isMuted() ? 0.0 : 1.0)).then(() => {
            if (adUnit.getVideoPosition() > 0) {
                videoPlayer.seekTo(adUnit.getVideoPosition()).then(() => {
                    videoPlayer.play();
                });
            } else {
                videoPlayer.play();
            }
        });
    }

    public static onVideoProgress(adUnit: VideoAdUnit, position: number): void {
        if (position > 0) {
            adUnit.setVideoPosition(position);
        }
        adUnit.getOverlay().setVideoProgress(position);
    }

    public static onVideoStart(adUnit: VideoAdUnit): void {
        adUnit.getSessionManager().sendStart(adUnit);

        if (adUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            adUnit.getNativeBridge().invoke('Listener', 'sendStartEvent', [adUnit.getPlacement().getId()]);
        }

        adUnit.newWatch();
    }

    public static onVideoCompleted(adUnit: VideoAdUnit, url: string): void {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.getSessionManager().sendView(adUnit);
        adUnit.getNativeBridge().invoke('AdUnit', 'setViews', [['webview']]);
        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
        adUnit.getStorageManager().get<boolean>(StorageType.PUBLIC, 'integration_test.value').then(integrationTest => {
            if (integrationTest) {
                adUnit.getNativeBridge().rawInvoke('com.unity3d.ads.test.integration', 'IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
            }
        });
    }

}