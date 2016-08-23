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
import { IObserver1, IObserver3 } from 'Utilities/IObserver';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { TestMetaData } from 'Utilities/TestMetaData';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign, configuration: Configuration): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, sessionManager, placement, campaign, configuration);
        } else {
            return this.createVideoAdUnit(nativeBridge, sessionManager, placement, campaign, configuration);
        }
    }

    private static createVideoAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign, configuration: Configuration): VideoAdUnit {
        let overlay = new Overlay(placement.muteVideo());
        let endScreen = new EndScreen(campaign, configuration.isCoppaCompliant());
        let videoAdUnit = new VideoAdUnit(nativeBridge, placement, campaign, overlay, endScreen);
        let testMetaData = new TestMetaData(nativeBridge);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, videoAdUnit, placement, campaign);
        this.prepareEndScreen(endScreen, nativeBridge, sessionManager, videoAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, videoAdUnit, testMetaData);

        return videoAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: VastCampaign, configuration: Configuration): VideoAdUnit {
        let overlay = new Overlay(placement.muteVideo());
        let vastAdUnit = new VastAdUnit(nativeBridge, placement, campaign, overlay);
        let testMetaData = new TestMetaData(nativeBridge);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, vastAdUnit, placement, campaign);
        this.prepareVideoPlayer(nativeBridge, sessionManager, vastAdUnit, testMetaData);

        return vastAdUnit;
    }

    private static prepareOverlay(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit, placement: Placement, campaign: Campaign) {
        overlay.render();
        document.body.appendChild(overlay.container());
        this.prepareOverlayEventHandlers(overlay, nativeBridge, sessionManager, videoAdUnit);

        overlay.setSpinnerEnabled(!campaign.isVideoCached());

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
            overlay.onCallButton.subscribe(() => VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, videoAdUnit));
        } else {
            overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, sessionManager, videoAdUnit));
            overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, sessionManager, videoAdUnit, muted));
        }
    };

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, videoAdUnit));
        endScreen.onPrivacy.subscribe((url) => EndScreenEventHandlers.onPrivacy(nativeBridge, url));
        endScreen.onClose.subscribe(() => EndScreenEventHandlers.onClose(nativeBridge, videoAdUnit));
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit, testMetaData: TestMetaData) {
        let onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, videoAdUnit, duration, testMetaData));
        let onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, videoAdUnit, position));
        let onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, videoAdUnit));

        let onCompletedObserver: IObserver1<string>;
        let onErrorObserver: IObserver3<number, number, string>;
        if (videoAdUnit instanceof VastAdUnit) {
            onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit, testMetaData));
            onErrorObserver = nativeBridge.VideoPlayer.onError.subscribe((what, extra, url) => VastVideoEventHandlers.onVideoError(nativeBridge, videoAdUnit, what, extra));
        } else {
            onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit, testMetaData));
            onErrorObserver = nativeBridge.VideoPlayer.onError.subscribe((what, extra, url) => VideoEventHandlers.onVideoError(nativeBridge, videoAdUnit, what, extra));
        }

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            nativeBridge.VideoPlayer.onError.unsubscribe(onErrorObserver);
        });

        if(nativeBridge.getPlatform() === Platform.IOS) {
            let onLikelyToKeepUpObserver = nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.subscribe((url, likelyToKeepUp) => {
                if(likelyToKeepUp === true) {
                    nativeBridge.VideoPlayer.play();
                }
            });
            videoAdUnit.onClose.subscribe(() => {
                nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.unsubscribe(onLikelyToKeepUpObserver);
            });
        }
    }

}
