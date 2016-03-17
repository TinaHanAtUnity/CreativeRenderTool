import { Double } from 'Utilities/Double';
import {VideoAdUnit} from "../AdUnits/VideoAdUnit";
import {FinishState} from "../Constants/FinishState";
import {AdUnit} from "../Native/Api/AdUnit";
import {Listener} from "../Native/Api/Listener";
import {VideoPlayer} from "../Native/Api/VideoPlayer";

export class VideoEventHandlers {

    public static onVideoPrepared(adUnit: VideoAdUnit, duration: number, width: number, height: number): void {
        adUnit.getOverlay().setVideoDuration(duration);
        VideoPlayer.setVolume(new Double(adUnit.getOverlay().isMuted() ? 0.0 : 1.0)).then(() => {
            if (adUnit.getVideoPosition() > 0) {
                VideoPlayer.seekTo(adUnit.getVideoPosition()).then(() => {
                    VideoPlayer.play();
                });
            } else {
                VideoPlayer.play();
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
        //adUnit.getSessionManager().sendStart(adUnit);

        if (adUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            Listener.sendStartEvent(adUnit.getPlacement().getId());
        }

        adUnit.newWatch();
    }

    public static onVideoCompleted(adUnit: VideoAdUnit, url: string): void {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        //adUnit.getSessionManager().sendView(adUnit);
        AdUnit.setViews(['webview']);
        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
        /*adUnit.getStorageManager().get<boolean>(StorageType.PUBLIC, 'integration_test.value').then(integrationTest => {
            if (integrationTest) {
                adUnit.getNativeBridge().rawInvoke('com.unity3d.ads.test.integration', 'IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
            }
        });*/
    }

}
