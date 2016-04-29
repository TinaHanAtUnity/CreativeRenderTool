import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { EndScreen } from 'Views/EndScreen';
import { Overlay } from 'Views/Overlay';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign): AbstractAdUnit {
        // todo: select ad unit based on placement
        return this.createVideoAdUnit(nativeBridge, sessionManager, placement, campaign);
    }

    private static createVideoAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign): VideoAdUnit {
        let overlay = new Overlay(placement.muteVideo());
        let endScreen = new EndScreen(campaign);
        let videoAdUnit = new VideoAdUnit(nativeBridge, sessionManager, placement, campaign, overlay, endScreen);

        this.prepareOverlay(overlay, nativeBridge, videoAdUnit, placement);
        this.prepareEndScreen(endScreen, nativeBridge, videoAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, videoAdUnit);

        return videoAdUnit;
    }

    private static prepareOverlay(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit, placement: Placement) {
        overlay.render();
        document.body.appendChild(overlay.container());
        overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, sessionManager, videoAdUnit));
        overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, muted));

        if (!placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(placement.allowSkipInSeconds());
        }
    }

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onReplay.subscribe(() => EndScreenEventHandlers.onReplay(nativeBridge, videoAdUnit));
        endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, videoAdUnit));
        endScreen.onClose.subscribe(() => videoAdUnit.hide());
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit) {
        let onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, videoAdUnit, duration));
        let onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(videoAdUnit, position));
        let onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, videoAdUnit));
        let onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit));

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });
    }

}