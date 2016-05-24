import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { VastOverlayEventHandlers } from 'EventHandlers/VastOverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { EndScreen } from 'Views/EndScreen';
import { Overlay } from 'Views/Overlay';
import { IObserver1 } from 'Utilities/IObserver';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, sessionManager, placement, campaign);
        } else {
            return this.createVideoAdUnit(nativeBridge, sessionManager, placement, campaign);
        }
    }

    private static createVideoAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign): VideoAdUnit {
        let overlay = new Overlay(placement.muteVideo());
        let endScreen: EndScreen = new EndScreen(campaign);
        let videoAdUnit = new VideoAdUnit(nativeBridge, placement, campaign, overlay, endScreen);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, videoAdUnit, placement);
        this.prepareEndScreen(endScreen, nativeBridge, sessionManager, videoAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, videoAdUnit);

        return videoAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: VastCampaign): VideoAdUnit {
        let overlay = new Overlay(placement.muteVideo());
        let vastAdUnit = new VastAdUnit(nativeBridge, placement, campaign, overlay);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, vastAdUnit, placement);
        this.prepareVideoPlayer(nativeBridge, sessionManager, vastAdUnit);

        return vastAdUnit;
    }

    private static prepareOverlay(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit, placement: Placement) {
        overlay.render();
        document.body.appendChild(overlay.container());
        this.prepareOverlayEventHandlers(overlay, nativeBridge, sessionManager, videoAdUnit);

        if(!placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(placement.allowSkipInSeconds());
        }
    }

    private static prepareOverlayEventHandlers(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit) {
        if (videoAdUnit instanceof VastAdUnit) {
            overlay.onSkip.subscribe((videoProgress) => VastOverlayEventHandlers.onSkip(nativeBridge, sessionManager, videoAdUnit));
            overlay.onMute.subscribe((muted) => VastOverlayEventHandlers.onMute(nativeBridge, sessionManager, videoAdUnit, muted));
        } else {
            overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, sessionManager, videoAdUnit));
            overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, sessionManager, videoAdUnit, muted));
        }
    };

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onReplay.subscribe(() => EndScreenEventHandlers.onReplay(nativeBridge, videoAdUnit));
        endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, videoAdUnit));
        endScreen.onClose.subscribe(() => EndScreenEventHandlers.onClose(nativeBridge, videoAdUnit));
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit) {
        let onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, videoAdUnit, duration));
        let onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(sessionManager, videoAdUnit, position));
        let onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, videoAdUnit));
        let onCompletedObserver: IObserver1<string>;
        if (videoAdUnit instanceof VastAdUnit) {
            onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit));
        } else {
            onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit));
        }

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });
    }

}
