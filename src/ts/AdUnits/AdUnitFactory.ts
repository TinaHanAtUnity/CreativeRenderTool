import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { VastOverlayEventHandlers } from 'EventHandlers/VastOverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { VastEndScreenEventHandlers } from 'EventHandlers/VastEndScreenEventHandlers';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { EndScreen } from 'Views/EndScreen';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Overlay } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { MetaData } from 'Utilities/MetaData';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandlers } from 'EventHandlers/PerformanceOverlayEventHandlers';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { DeviceInfo } from 'Models/DeviceInfo';
import { HtmlCampaign } from 'Models/HtmlCampaign';
import { ThirdParty } from 'Views/ThirdParty';
import { HtmlAdUnit } from 'AdUnits/HtmlAdUnit';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { AdUnit } from 'Utilities/AdUnit';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';
import { VideoOverlay } from 'Views/VideoOverlay';
import { AbTest } from 'Utilities/AbTest';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, adUnit: AdUnit, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: Campaign, configuration: Configuration, options: any): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, adUnit, deviceInfo, sessionManager, placement, campaign, options);
        } else if(campaign instanceof HtmlCampaign) {
            return this.createHtmlAdUnit(nativeBridge, adUnit, deviceInfo, sessionManager, placement, campaign, options);
        } else if(campaign instanceof PerformanceCampaign) {
            return this.createPerformanceAdUnit(nativeBridge, adUnit, deviceInfo, sessionManager, placement, campaign, configuration, options);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createPerformanceAdUnit(nativeBridge: NativeBridge, adUnit: AdUnit, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: PerformanceCampaign, configuration: Configuration, options: any): AbstractAdUnit {
        let overlay: AbstractVideoOverlay;
        if (AbTest.isOverlayTestActive(campaign)) {
            overlay = new VideoOverlay(nativeBridge, placement.muteVideo(), deviceInfo.getLanguage());
        } else {
            overlay = new Overlay(nativeBridge, placement.muteVideo(), deviceInfo.getLanguage());
        }

        const endScreen = new EndScreen(nativeBridge, campaign, configuration.isCoppaCompliant(), deviceInfo.getLanguage());
        const metaData = new MetaData(nativeBridge);

        const videoAdUnitController = this.createVideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, options);
        const performanceAdUnit = new PerformanceAdUnit(nativeBridge, adUnit, videoAdUnitController, endScreen);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, performanceAdUnit);
        overlay.setSpinnerEnabled(!campaign.getVideo().isCached());

        this.preparePerformanceOverlayEventHandlers(overlay, performanceAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, performanceAdUnit, metaData);
        this.prepareEndScreen(endScreen, nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => PerformanceVideoEventHandlers.onVideoCompleted(performanceAdUnit));
        const onVideoErrorObserver = videoAdUnitController.onVideoError.subscribe(() => PerformanceVideoEventHandlers.onVideoError(performanceAdUnit));

        performanceAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            videoAdUnitController.onVideoError.unsubscribe(onVideoErrorObserver);
        });

        videoAdUnitController.onVideoClose.subscribe(() => {
            performanceAdUnit.hide();
        });

        return performanceAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, adUnit: AdUnit, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: VastCampaign, options: any): AbstractAdUnit {
        let overlay: AbstractVideoOverlay;
        if (AbTest.isOverlayTestActive(campaign)) {
            overlay = new VideoOverlay(nativeBridge, placement.muteVideo(), deviceInfo.getLanguage());
        } else {
            overlay = new Overlay(nativeBridge, placement.muteVideo(), deviceInfo.getLanguage());
        }

        let vastAdUnit: VastAdUnit;

        const metaData = new MetaData(nativeBridge);
        const videoAdUnitController = this.createVideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, options);

        if (campaign.hasEndscreen()) {
            const vastEndScreen = new VastEndScreen(nativeBridge, campaign);
            vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController, vastEndScreen);
            this.prepareVastEndScreen(vastEndScreen, nativeBridge, sessionManager, vastAdUnit, deviceInfo);
        } else {
            vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController);
        }

        this.prepareOverlay(overlay, nativeBridge, sessionManager, vastAdUnit);
        overlay.setSpinnerEnabled(!campaign.getVideo().isCached());

        this.prepareVastOverlayEventHandlers(overlay, nativeBridge, sessionManager, vastAdUnit);
        this.prepareVideoPlayer(nativeBridge, sessionManager, vastAdUnit, metaData);

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(sessionManager, vastAdUnit));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VastVideoEventHandlers.onVideoStart(sessionManager, vastAdUnit));

        vastAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
        });

        return vastAdUnit;
    }

    private static createHtmlAdUnit(nativeBridge: NativeBridge, adUnit: AdUnit, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: HtmlCampaign, options: any): AbstractAdUnit {
        const thirdParty = new ThirdParty(nativeBridge, placement, campaign);
        const thirdPartyAdUnit = new HtmlAdUnit(nativeBridge, adUnit, sessionManager, placement, campaign, thirdParty, options);

        thirdParty.render();
        document.body.appendChild(thirdParty.container());
        thirdParty.onClick.subscribe(() => sessionManager.sendClick(thirdPartyAdUnit));
        thirdParty.onClose.subscribe(() => thirdPartyAdUnit.hide());

        return thirdPartyAdUnit;
    }

    private static prepareOverlay(overlay: AbstractVideoOverlay, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit) {
        overlay.render();
        document.body.appendChild(overlay.container());

        if(!adUnit.getPlacement().allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(adUnit.getPlacement().allowSkipInSeconds());
        }

        overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, sessionManager, adUnit));
        overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, muted));
    }

    private static preparePerformanceOverlayEventHandlers(overlay: AbstractVideoOverlay, adUnit: PerformanceAdUnit) {
        overlay.onSkip.subscribe((videoProgress) => PerformanceOverlayEventHandlers.onSkip(adUnit));
    }

    private static prepareVastOverlayEventHandlers(overlay: AbstractVideoOverlay, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit) {
        overlay.onSkip.subscribe((videoProgress) => VastOverlayEventHandlers.onSkip(adUnit));
        overlay.onCallButton.subscribe(() => VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, adUnit));
        overlay.onMute.subscribe((muted) => VastOverlayEventHandlers.onMute(sessionManager, adUnit, muted));

    };

    private static createVideoAdUnitController(nativeBridge: NativeBridge, adUnit: AdUnit, placement: Placement, campaign: Campaign, overlay: AbstractVideoOverlay, options: any): VideoAdUnitController {
        return new VideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, options);
    }

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: PerformanceAdUnit, deviceInfo: DeviceInfo) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onPrivacy.subscribe((url) => EndScreenEventHandlers.onPrivacy(nativeBridge, url));
        endScreen.onClose.subscribe(() => EndScreenEventHandlers.onClose(adUnit));

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownloadAndroid(nativeBridge, sessionManager, adUnit));
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => EndScreenEventHandlers.onKeyEvent(keyCode, adUnit));
            adUnit.onClose.subscribe(() => {
                nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
            });
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownloadIos(nativeBridge, sessionManager, adUnit, deviceInfo));
        }
    }

    private static prepareVastEndScreen(endScreen: VastEndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit, deviceInfo: DeviceInfo) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onClose.subscribe(() => VastEndScreenEventHandlers.onClose(adUnit));

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            endScreen.onClick.subscribe(() => VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, adUnit));
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => EndScreenEventHandlers.onKeyEvent(keyCode, adUnit));
            adUnit.onClose.subscribe(() => {
                nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
            });
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            endScreen.onClick.subscribe(() => VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, adUnit));
        }
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, metaData: MetaData) {
        const onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, duration, metaData));
        const onPrepareTimeoutObserver = nativeBridge.VideoPlayer.onPrepareTimeout.subscribe((url) => VideoEventHandlers.onVideoPrepareTimeout(nativeBridge, adUnit.getVideoAdUnitController(), url));
        const onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, position));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoPlay(nativeBridge, adUnit));
        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, metaData));

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onPrepareTimeout.unsubscribe(onPrepareTimeoutObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(nativeBridge, adUnit.getVideoAdUnitController());
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.prepareIosVideoPlayer(nativeBridge, adUnit.getVideoAdUnitController());
        }
    }

    private static prepareAndroidVideoPlayer(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController) {
        const onGenericErrorObserver = nativeBridge.VideoPlayer.Android.onGenericError.subscribe((what, extra, url) => VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnitController, what, extra, url));
        const onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Android.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnitController, url));
        const onVideoSeekToErrorObserver = nativeBridge.VideoPlayer.Android.onSeekToError.subscribe((url) => VideoEventHandlers.onSeekToError(nativeBridge, videoAdUnitController, url));
        const onVideoPauseErrorObserver = nativeBridge.VideoPlayer.Android.onPauseError.subscribe((url) => VideoEventHandlers.onPauseError(nativeBridge, videoAdUnitController, url));
        const onVideoIllegalStateErrorObserver = nativeBridge.VideoPlayer.Android.onIllegalStateError.subscribe(() => VideoEventHandlers.onIllegalStateError(nativeBridge, videoAdUnitController));

        videoAdUnitController.onVideoClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Android.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);
            nativeBridge.VideoPlayer.Android.onSeekToError.unsubscribe(onVideoSeekToErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPauseErrorObserver);
            nativeBridge.VideoPlayer.Android.onIllegalStateError.unsubscribe(onVideoIllegalStateErrorObserver);
        });
    }

    private static prepareIosVideoPlayer(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController) {
        const onGenericErrorObserver = nativeBridge.VideoPlayer.Ios.onGenericError.subscribe((url, description) => VideoEventHandlers.onIosGenericVideoError(nativeBridge, videoAdUnitController, url, description));
        const onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Ios.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnitController, url));

        const onLikelyToKeepUpObserver = nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.subscribe((url, likelyToKeepUp) => {
            if(likelyToKeepUp === true) {
                nativeBridge.VideoPlayer.play();
            }
        });

        videoAdUnitController.onVideoClose.subscribe(() => {
            nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.unsubscribe(onLikelyToKeepUpObserver);
            nativeBridge.VideoPlayer.Ios.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Ios.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);
        });
    }

}
