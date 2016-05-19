import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number): void {
        adUnit.getOverlay().setVideoDuration(duration);
        nativeBridge.VideoPlayer.setVolume(new Double(adUnit.getOverlay().isMuted() ? 0.0 : 1.0)).then(() => {
            if(adUnit.getVideoPosition() > 0) {
                nativeBridge.VideoPlayer.seekTo(adUnit.getVideoPosition()).then(() => {
                    nativeBridge.VideoPlayer.play();
                });
            } else {
                nativeBridge.VideoPlayer.play();
            }
        });
    }

    public static onVideoProgress(sessionManager: SessionManager, adUnit: VideoAdUnit, position: number): void {
        sessionManager.sendProgress(adUnit, sessionManager.getSession(), position, adUnit.getVideoPosition());
        if (position > 0) {
            adUnit.setVideoPosition(position);
        }
        adUnit.getOverlay().setVideoProgress(position);
    }

    public static onVideoStart(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        sessionManager.sendStart(adUnit);

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
        this.afterVideoCompleted(adUnit);
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

    protected static afterVideoCompleted(adUnit: VideoAdUnit) {
        adUnit.getEndScreen().show();
    };

}
