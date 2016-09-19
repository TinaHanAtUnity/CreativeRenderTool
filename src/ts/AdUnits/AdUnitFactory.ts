import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { AndroidVideoAdUnit } from 'AdUnits/AndroidVideoAdUnit';
import { IosVideoAdUnit } from 'AdUnits/IosVideoAdUnit';
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
import { IObserver0, IObserver1, IObserver2, IObserver3 } from 'Utilities/IObserver';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { MetaData } from 'Utilities/MetaData';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign, configuration: Configuration, options: any): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, sessionManager, placement, campaign);
        } else {
            return this.createPerformanceAdUnit(nativeBridge, sessionManager, placement, campaign, configuration);
        }
    }

    private static createPerformanceAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign, configuration: Configuration): AbstractAdUnit {
        let overlay = new Overlay(nativeBridge, placement.muteVideo());
        let endScreen = new EndScreen(nativeBridge, campaign, configuration.isCoppaCompliant());
        let metaData = new MetaData(nativeBridge);

        let videoAdUnit = this.createVideoUnit(nativeBridge, placement, campaign, overlay);
        let performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnit, endScreen);

        this.prepareOverlay(overlay, placement, campaign);
        this.preparePerformanceOverlayEventHandlers(overlay, nativeBridge, sessionManager, performanceAdUnit, videoAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, performanceAdUnit, videoAdUnit, metaData);
        this.prepareEndScreen(endScreen, nativeBridge, sessionManager, performanceAdUnit);

        return performanceAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: Campaign): AbstractAdUnit {
        let overlay = new Overlay(nativeBridge, placement.muteVideo());
        let metaData = new MetaData(nativeBridge);
        let videoAdUnit = this.createVideoUnit(nativeBridge, placement, campaign, overlay);

        let vastAdUnit = new VastAdUnit(nativeBridge, videoAdUnit);

        this.prepareOverlay(overlay, placement, campaign);
        this.prepareVastOverlayEventHandlers(overlay, nativeBridge, sessionManager, vastAdUnit, videoAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, vastAdUnit, videoAdUnit, metaData);

        let onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(vastAdUnit));
        vastAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });

        return vastAdUnit;
    }

    private static prepareOverlay(overlay: Overlay, placement: Placement, campaign: Campaign) {
        overlay.render();
        document.body.appendChild(overlay.container());
        overlay.setSpinnerEnabled(!campaign.isVideoCached());

        if(!placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(placement.allowSkipInSeconds());
        }
    }

    private static preparePerformanceOverlayEventHandlers(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit) {
        overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, sessionManager, adUnit, videoAdUnit));
        overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, sessionManager, adUnit, muted));
    }

    private static prepareVastOverlayEventHandlers(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit) {
        overlay.onSkip.subscribe((videoProgress) => VastOverlayEventHandlers.onSkip(nativeBridge, sessionManager, adUnit, videoAdUnit));
        overlay.onMute.subscribe((muted) => VastOverlayEventHandlers.onMute(nativeBridge, sessionManager, adUnit, muted));
        overlay.onCallButton.subscribe(() => VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, <VastAdUnit>adUnit));
    };

    private static createVideoUnit(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay): VideoAdUnit {
        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            return new AndroidVideoAdUnit(nativeBridge, placement, campaign, overlay);
        } else {
            return new IosVideoAdUnit(nativeBridge, placement, campaign, overlay);
        }
    }

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(nativeBridge, sessionManager, adUnit));
        endScreen.onPrivacy.subscribe((url) => EndScreenEventHandlers.onPrivacy(nativeBridge, url));
        endScreen.onClose.subscribe(() => EndScreenEventHandlers.onClose(nativeBridge, adUnit));
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit, metaData: MetaData) {
        let onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, videoAdUnit, duration, metaData));
        let onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, videoAdUnit, position));
        let onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit, videoAdUnit));
        let onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, videoAdUnit, metaData));

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(nativeBridge, adUnit, videoAdUnit);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.prepareIosVideoPlayer(nativeBridge, adUnit, videoAdUnit);
        }
    }

    private static prepareAndroidVideoPlayer(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit) {
        let onGenericErrorObserver: IObserver3<number, number, string>;
        let onVideoPrepareErrorObserver: IObserver1<string>;
        let onVideoSeekToErrorObserver: IObserver1<string>;
        let onVideoPauseErrorObserver: IObserver1<string>;
        let onVideoIllegalStateErrorObserver: IObserver0;

        onGenericErrorObserver = nativeBridge.VideoPlayer.Android.onGenericError.subscribe((what, extra, url) => VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnit, what, extra, url));
        onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Android.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));
        onVideoSeekToErrorObserver = nativeBridge.VideoPlayer.Android.onSeekToError.subscribe((url) => VideoEventHandlers.onSeekToError(nativeBridge, videoAdUnit, url));
        onVideoPauseErrorObserver = nativeBridge.VideoPlayer.Android.onPauseError.subscribe((url) => VideoEventHandlers.onPauseError(nativeBridge, videoAdUnit, url));
        onVideoIllegalStateErrorObserver = nativeBridge.VideoPlayer.Android.onIllegalStateError.subscribe(() => VideoEventHandlers.onIllegalStateError(nativeBridge, videoAdUnit));

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPrepareErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoSeekToErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPauseErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoIllegalStateErrorObserver);
        });
    }

    private static prepareIosVideoPlayer(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit) {
        let onGenericErrorObserver: IObserver2<string, string>;
        let onVideoPrepareErrorObserver: IObserver1<string>;

        onGenericErrorObserver = nativeBridge.VideoPlayer.Ios.onGenericError.subscribe((url, description) => VideoEventHandlers.onIosGenericVideoError(nativeBridge, videoAdUnit, url, description));
        onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Ios.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));

        let onLikelyToKeepUpObserver = nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.subscribe((url, likelyToKeepUp) => {
            if(likelyToKeepUp === true) {
                nativeBridge.VideoPlayer.play();
            }
        });
        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.unsubscribe(onLikelyToKeepUpObserver);
            nativeBridge.VideoPlayer.Ios.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Ios.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);
        });
    }

}
