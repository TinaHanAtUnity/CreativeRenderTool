import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { AndroidVideoAdUnit } from 'AdUnits/VideoAdUnit';
import { IosVideoAdUnit } from 'AdUnits/VideoAdUnit';
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
        let overlay = new Overlay(nativeBridge, placement.muteVideo());
        let endScreen = new EndScreen(nativeBridge, campaign, configuration.isCoppaCompliant());


        let videoAdUnit: VideoAdUnit;
        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            videoAdUnit = new AndroidVideoAdUnit(nativeBridge, placement, campaign, overlay, endScreen);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            videoAdUnit = new IosVideoAdUnit(nativeBridge, placement, campaign, overlay, endScreen);
        }

        let metaData = new MetaData(nativeBridge);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, videoAdUnit, placement, campaign);
        this.prepareEndScreen(endScreen, nativeBridge, sessionManager, videoAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, videoAdUnit, metaData);

        return videoAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager, placement: Placement, campaign: VastCampaign, configuration: Configuration): VideoAdUnit {
        let overlay = new Overlay(nativeBridge, placement.muteVideo());
        let vastAdUnit = new VastAdUnit(nativeBridge, placement, campaign, overlay);
        let metaData = new MetaData(nativeBridge);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, vastAdUnit, placement, campaign);
        this.prepareVideoPlayer(nativeBridge, sessionManager, vastAdUnit, metaData);

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

    private static prepareVideoPlayer(nativeBridge: NativeBridge, sessionManager: SessionManager, videoAdUnit: VideoAdUnit, metaData: MetaData) {
        let onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, videoAdUnit, duration, metaData));
        let onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, videoAdUnit, position));
        let onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, videoAdUnit));

        let onCompletedObserver: IObserver1<string>;
        if (videoAdUnit instanceof VastAdUnit) {
            onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit, metaData));
        } else {
            onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, videoAdUnit, metaData));
        }

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(nativeBridge, videoAdUnit);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.prepareIosVideoPlayer(nativeBridge, videoAdUnit);
        }
    }

    private static prepareAndroidVideoPlayer(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        let onGenericErrorObserver: IObserver3<number, number, string>;
        let onVideoPrepareErrorObserver: IObserver1<string>;
        let onVideoSeekToErrorObserver: IObserver1<string>;
        let onVideoPauseErrorObserver: IObserver1<string>;
        let onVideoIllegalStateErrorObserver: IObserver0;

        if (videoAdUnit instanceof VastAdUnit) {
            onGenericErrorObserver = nativeBridge.VideoPlayer.Android.onGenericError.subscribe((what, extra, url) => VastVideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnit, what, extra, url));
            onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Android.onPrepareError.subscribe((url) => VastVideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));
            onVideoSeekToErrorObserver = nativeBridge.VideoPlayer.Android.onSeekToError.subscribe((url) => VastVideoEventHandlers.onSeekToError(nativeBridge, videoAdUnit, url));
            onVideoPauseErrorObserver = nativeBridge.VideoPlayer.Android.onPauseError.subscribe((url) => VastVideoEventHandlers.onPauseError(nativeBridge, videoAdUnit, url));
            onVideoIllegalStateErrorObserver = nativeBridge.VideoPlayer.Android.onIllegalStateError.subscribe(() => VastVideoEventHandlers.onIllegalStateError(nativeBridge, videoAdUnit));
        } else {
            onGenericErrorObserver = nativeBridge.VideoPlayer.Android.onGenericError.subscribe((what, extra, url) => VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnit, what, extra, url));
            onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Android.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));
            onVideoSeekToErrorObserver = nativeBridge.VideoPlayer.Android.onSeekToError.subscribe((url) => VideoEventHandlers.onSeekToError(nativeBridge, videoAdUnit, url));
            onVideoPauseErrorObserver = nativeBridge.VideoPlayer.Android.onPauseError.subscribe((url) => VideoEventHandlers.onPauseError(nativeBridge, videoAdUnit, url));
            onVideoIllegalStateErrorObserver = nativeBridge.VideoPlayer.Android.onIllegalStateError.subscribe(() => VideoEventHandlers.onIllegalStateError(nativeBridge, videoAdUnit));
        }

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPrepareErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoSeekToErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPauseErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoIllegalStateErrorObserver);

        });
    }

    private static prepareIosVideoPlayer(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        let onGenericErrorObserver: IObserver2<string, string>;
        let onVideoPrepareErrorObserver: IObserver1<string>;

        if (videoAdUnit instanceof VastAdUnit) {
            onGenericErrorObserver = nativeBridge.VideoPlayer.Ios.onGenericError.subscribe((url, description) => VastVideoEventHandlers.onIosGenericVideoError(nativeBridge, videoAdUnit, url, description));
            onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Ios.onPrepareError.subscribe((url) => VastVideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));

        } else {
            onGenericErrorObserver = nativeBridge.VideoPlayer.Ios.onGenericError.subscribe((url, description) => VideoEventHandlers.onIosGenericVideoError(nativeBridge, videoAdUnit, url, description));
            onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Ios.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));

        }

        let onLikelyToKeepUpObserver = nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.subscribe((url, likelyToKeepUp) => {
            if(likelyToKeepUp === true) {
                nativeBridge.VideoPlayer.play();
            }
        });
        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.unsubscribe(onLikelyToKeepUpObserver);
            nativeBridge.VideoPlayer.Ios.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Ios.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);

        });

    }

}
