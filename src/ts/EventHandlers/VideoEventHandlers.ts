import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { AdUnitApi } from 'Native/Api/AdUnit';
import { ListenerApi } from 'Native/Api/Listener';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';

export class VideoEventHandlers {

    public static onVideoPrepared(adUnit: VideoAdUnit, duration: number, width: number, height: number): void {
        adUnit.getOverlay().setVideoDuration(duration);
        VideoPlayerApi.setVolume(new Double(adUnit.getOverlay().isMuted() ? 0.0 : 1.0)).then(() => {
            if (adUnit.getVideoPosition() > 0) {
                VideoPlayerApi.seekTo(adUnit.getVideoPosition()).then(() => {
                    VideoPlayerApi.play();
                });
            } else {
                VideoPlayerApi.play();
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
        adUnit.getSession().sendStart(adUnit);

        if (adUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            ListenerApi.sendStartEvent(adUnit.getPlacement().getId());
        }

        adUnit.newWatch();
    }

    public static onVideoCompleted(adUnit: VideoAdUnit, url: string): void {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.getSession().sendView(adUnit);
        AdUnitApi.setViews(['webview']);
        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
        StorageApi.get<boolean>(StorageType.PUBLIC, 'integration_test.value').then(integrationTest => {
            if (integrationTest) {
                NativeBridge.getInstance().rawInvoke('com.unity3d.ads.test.integration', 'IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
            }
        });
    }

}
