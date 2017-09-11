import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { DisplayInterstitialCampaign } from 'Models/DisplayInterstitialCampaign';
import { DisplayInterstitialAdUnit } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { VastOverlayEventHandlers } from 'EventHandlers/VastOverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { VastEndScreenEventHandlers } from 'EventHandlers/VastEndScreenEventHandlers';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { EndScreen } from 'Views/EndScreen';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandlers } from 'EventHandlers/PerformanceOverlayEventHandlers';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { DeviceInfo } from 'Models/DeviceInfo';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Overlay } from 'Views/Overlay';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { MRAIDView } from 'Views/MRAIDView';
import { MRAID } from 'Views/MRAID';
import { PlayableMRAID } from 'Views/PlayableMRAID';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { FinishState } from 'Constants/FinishState';
import { Video } from 'Models/Assets/Video';
import { WebViewError } from 'Errors/WebViewError';
import { MRAIDEventHandlers } from 'EventHandlers/MRAIDEventHandlers';
import { Request } from 'Utilities/Request';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: Campaign, configuration: Configuration, request: Request, options: any): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, forceOrientation, container, deviceInfo, sessionManager, placement, campaign, request, configuration, options);
        } else if(campaign instanceof MRAIDCampaign) {
            return this.createMRAIDAdUnit(nativeBridge, forceOrientation, container, deviceInfo, sessionManager, placement, campaign, request, configuration, options);
        } else if(campaign instanceof PerformanceCampaign) {
            return this.createPerformanceAdUnit(nativeBridge, forceOrientation, container, deviceInfo, sessionManager, placement, campaign, configuration, options);
        } else if (campaign instanceof DisplayInterstitialCampaign) {
            return this.createDisplayInterstitialAdUnit(nativeBridge, forceOrientation, container, deviceInfo, sessionManager, placement, campaign, options);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createPerformanceAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: PerformanceCampaign, configuration: Configuration, options: any): AbstractAdUnit {
        const overlay = new Overlay(nativeBridge, placement.muteVideo(), deviceInfo.getLanguage());
        const endScreen = new EndScreen(nativeBridge, campaign, configuration.isCoppaCompliant(), deviceInfo.getLanguage());

        const video = this.getOrientedVideo(campaign, forceOrientation);
        const performanceAdUnit = new PerformanceAdUnit(nativeBridge, forceOrientation, container, placement, campaign, video, overlay, deviceInfo, options, endScreen);

        this.prepareOverlay(overlay, nativeBridge, sessionManager, performanceAdUnit);

        const landscapeVideo = campaign.getVideo();
        const landscapeVideoCached = landscapeVideo && landscapeVideo.isCached();
        const portraitVideo = campaign.getPortraitVideo();
        const portraitVideoCached = portraitVideo && portraitVideo.isCached();
        overlay.setSpinnerEnabled(!landscapeVideoCached && !portraitVideoCached);

        this.preparePerformanceOverlayEventHandlers(overlay, performanceAdUnit);
        this.prepareVideoPlayer(nativeBridge, container, sessionManager, configuration, performanceAdUnit);
        this.prepareEndScreen(endScreen, nativeBridge, sessionManager, performanceAdUnit, deviceInfo);

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => PerformanceVideoEventHandlers.onVideoCompleted(performanceAdUnit));
        const onVideoErrorObserver = performanceAdUnit.onError.subscribe(() => PerformanceVideoEventHandlers.onVideoError(performanceAdUnit));

        performanceAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            performanceAdUnit.onError.unsubscribe(onVideoErrorObserver);
        });

        performanceAdUnit.onClose.subscribe(() => {
            performanceAdUnit.hide();
        });

        return performanceAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: VastCampaign, request: Request, configuration: Configuration, options: any): AbstractAdUnit {
        const overlay = new Overlay(nativeBridge, placement.muteVideo(), deviceInfo.getLanguage());

        let vastAdUnit: VastAdUnit;
        if (campaign.hasEndscreen()) {
            const vastEndScreen = new VastEndScreen(nativeBridge, campaign);
            vastAdUnit = new VastAdUnit(nativeBridge, forceOrientation, container, placement, campaign, overlay, deviceInfo, options, vastEndScreen);
            this.prepareVastEndScreen(vastEndScreen, nativeBridge, sessionManager, vastAdUnit, deviceInfo, request);
        } else {
            vastAdUnit = new VastAdUnit(nativeBridge, forceOrientation, container, placement, campaign, overlay, deviceInfo, options);
        }

        this.prepareOverlay(overlay, nativeBridge, sessionManager, vastAdUnit);
        overlay.setSpinnerEnabled(!campaign.getVideo().isCached());

        this.prepareVastOverlayEventHandlers(overlay, nativeBridge, sessionManager, vastAdUnit, request);
        this.prepareVideoPlayer(nativeBridge, container, sessionManager, configuration, vastAdUnit);

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(sessionManager, vastAdUnit));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VastVideoEventHandlers.onVideoStart(sessionManager, vastAdUnit));
        const onVideoErrorObserver = vastAdUnit.onError.subscribe(() => VastVideoEventHandlers.onVideoError(vastAdUnit));

        vastAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            vastAdUnit.onError.unsubscribe(onVideoErrorObserver);
        });

        return vastAdUnit;
    }

    private static createMRAIDAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: MRAIDCampaign, request: Request, configuration: Configuration, options: any): AbstractAdUnit {
        let mraid: MRAIDView;
        const resourceUrl = campaign.getResourceUrl();
        let endScreen: EndScreen | undefined;
        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity|roll-the-ball/)) {
            mraid = new PlayableMRAID(nativeBridge, placement, campaign, deviceInfo.getLanguage());
        } else {
            mraid = new MRAID(nativeBridge, placement, campaign);
        }

        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) {
            endScreen = new EndScreen(nativeBridge, campaign, configuration.isCoppaCompliant(), deviceInfo.getLanguage());
        }

        const mraidAdUnit = new MRAIDAdUnit(nativeBridge, container, sessionManager, placement, campaign, mraid, options, endScreen);

        mraid.render();
        document.body.appendChild(mraid.container());

        mraid.onClick.subscribe((url) => MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, url));

        mraid.onReward.subscribe(() => {
            sessionManager.sendThirdQuartile(mraidAdUnit);
        });

        mraid.onAnalyticsEvent.subscribe((timeFromShow, timeFromPlayableStart, event, eventData) => MRAIDEventHandlers.onAnalyticsEvent(campaign, timeFromShow, timeFromPlayableStart, event, eventData));
        if(endScreen) {
            this.prepareEndScreen(endScreen, nativeBridge, sessionManager, mraidAdUnit, deviceInfo);
            if(mraid instanceof PlayableMRAID) {
                (<PlayableMRAID>mraid).onShowEndScreen.subscribe(() => MRAIDEventHandlers.onShowEndScreen(mraidAdUnit));
            }
        }

        mraid.onSkip.subscribe(() => {
            mraidAdUnit.setFinishState(FinishState.SKIPPED);
            mraidAdUnit.hide();
        });
        mraid.onClose.subscribe(() => {
            mraidAdUnit.setFinishState(FinishState.COMPLETED);
            mraidAdUnit.hide();
        });

        return mraidAdUnit;
    }

    private static prepareOverlay(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit) {
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

    private static preparePerformanceOverlayEventHandlers(overlay: Overlay, adUnit: PerformanceAdUnit) {
        overlay.onSkip.subscribe((videoProgress) => PerformanceOverlayEventHandlers.onSkip(adUnit));
    }

    private static prepareVastOverlayEventHandlers(overlay: Overlay, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit, request: Request) {
        overlay.onSkip.subscribe((videoProgress) => VastOverlayEventHandlers.onSkip(adUnit));
        overlay.onCallButton.subscribe(() => VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, adUnit, request));
        overlay.onMute.subscribe((muted) => VastOverlayEventHandlers.onMute(sessionManager, adUnit, muted));
    }

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, deviceInfo: DeviceInfo) {
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

    private static prepareVastEndScreen(endScreen: VastEndScreen, nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit, deviceInfo: DeviceInfo, request: Request) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onClose.subscribe(() => VastEndScreenEventHandlers.onClose(adUnit));
        endScreen.onShow.subscribe(() => VastEndScreenEventHandlers.onShow(sessionManager, adUnit));

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            endScreen.onClick.subscribe(() => VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, adUnit, request));
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => EndScreenEventHandlers.onKeyEvent(keyCode, adUnit));
            adUnit.onClose.subscribe(() => {
                nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
            });
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            endScreen.onClick.subscribe(() => VastEndScreenEventHandlers.onClick(nativeBridge, sessionManager, adUnit, request));
        }
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, configuration: Configuration, adUnit: VideoAdUnit) {
        const onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((url, duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, duration));
        const onPrepareTimeoutObserver = nativeBridge.VideoPlayer.onPrepareTimeout.subscribe((url) => VideoEventHandlers.onVideoPrepareTimeout(nativeBridge, adUnit, url));
        const onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, position, configuration));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoPlay(nativeBridge, adUnit));
        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(sessionManager, adUnit));

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onPrepareTimeout.unsubscribe(onPrepareTimeoutObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(nativeBridge, adUnit);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.prepareIosVideoPlayer(nativeBridge, <ViewController>container, adUnit);
        }
    }

    private static prepareAndroidVideoPlayer(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        const onGenericErrorObserver = nativeBridge.VideoPlayer.Android.onGenericError.subscribe((url, what, extra) => VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnit, what, extra, url));
        const onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Android.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));
        const onVideoSeekToErrorObserver = nativeBridge.VideoPlayer.Android.onSeekToError.subscribe((url) => VideoEventHandlers.onSeekToError(nativeBridge, videoAdUnit, url));
        const onVideoPauseErrorObserver = nativeBridge.VideoPlayer.Android.onPauseError.subscribe((url) => VideoEventHandlers.onPauseError(nativeBridge, videoAdUnit, url));
        const onVideoIllegalStateErrorObserver = nativeBridge.VideoPlayer.Android.onIllegalStateError.subscribe(() => VideoEventHandlers.onIllegalStateError(nativeBridge, videoAdUnit));

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Android.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);
            nativeBridge.VideoPlayer.Android.onSeekToError.unsubscribe(onVideoSeekToErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPauseErrorObserver);
            nativeBridge.VideoPlayer.Android.onIllegalStateError.unsubscribe(onVideoIllegalStateErrorObserver);
        });
    }

    private static prepareIosVideoPlayer(nativeBridge: NativeBridge, container: AdUnitContainer, videoAdUnit: VideoAdUnit) {
        const onGenericErrorObserver = nativeBridge.VideoPlayer.Ios.onGenericError.subscribe((url, description) => VideoEventHandlers.onIosGenericVideoError(nativeBridge, videoAdUnit, url, description));
        const onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Ios.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, url));
        const onLikelyToKeepUpObserver = nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.subscribe((url, likelyToKeepUp) => VideoEventHandlers.onIosVideoLikelyToKeepUp(nativeBridge, videoAdUnit, container, likelyToKeepUp));

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.unsubscribe(onLikelyToKeepUpObserver);
            nativeBridge.VideoPlayer.Ios.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Ios.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);
        });
    }

    private static getOrientedVideo(campaign: PerformanceCampaign, forceOrientation: ForceOrientation): Video {
        const landscapeVideo = AdUnitFactory.getLandscapeVideo(campaign);
        const portraitVideo = AdUnitFactory.getPortraitVideo(campaign);

        if(forceOrientation === ForceOrientation.LANDSCAPE) {
            if(landscapeVideo) {
                return landscapeVideo;
            }
            if(portraitVideo) {
                return portraitVideo;
            }
        }

        if(forceOrientation === ForceOrientation.PORTRAIT) {
            if(portraitVideo) {
                return portraitVideo;
            }
            if(landscapeVideo) {
                return landscapeVideo;
            }
        }

        throw new WebViewError('Unable to select an oriented video');
    }

    private static getLandscapeVideo(campaign: PerformanceCampaign): Video | undefined {
        const video = campaign.getVideo();
        const streaming = campaign.getStreamingVideo();
        if(video) {
            if(video.isCached()) {
                return video;
            }
            if(streaming) {
                return streaming;
            }
        }
        return undefined;
    }

    private static getPortraitVideo(campaign: PerformanceCampaign): Video | undefined {
        const video = campaign.getPortraitVideo();
        const streaming = campaign.getStreamingPortraitVideo();
        if(video) {
            if(video.isCached()) {
                return video;
            }
            if(streaming) {
                return streaming;
            }
        }
        return undefined;
    }

    private static createDisplayInterstitialAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, sessionManager: SessionManager, placement: Placement, campaign: DisplayInterstitialCampaign, options: any): AbstractAdUnit {
        const view = new DisplayInterstitial(nativeBridge, placement, campaign);
        const programmaticAdUnit = new DisplayInterstitialAdUnit(nativeBridge, container, sessionManager, placement, campaign, view, options);

        view.render();
        document.body.appendChild(view.container());

        const onClose = () => {
            sessionManager.sendView(programmaticAdUnit);
            programmaticAdUnit.hide();
        };

        const openLink = (href: string) => {
            sessionManager.sendClick(programmaticAdUnit);

            for (let url of campaign.getTrackingUrlsForEvent('click')) {
                url = url.replace(/%ZONE%/, placement.getId());
                url = url.replace(/%SDK_VERSION%/, sessionManager.getClientInfo().getSdkVersion().toString());
                sessionManager.getEventManager().thirdPartyEvent('display click', sessionManager.getSession().getId(), url);
            }

            if(nativeBridge.getPlatform() === Platform.ANDROID) {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': href
                });
            } else {
                nativeBridge.UrlScheme.open(href);
            }
        };

        programmaticAdUnit.onStart.subscribe(() => {
            for (let url of campaign.getTrackingUrlsForEvent('impression')) {
                url = url.replace(/%ZONE%/, placement.getId());
                url = url.replace(/%SDK_VERSION%/, sessionManager.getClientInfo().getSdkVersion().toString());
                sessionManager.getEventManager().thirdPartyEvent('display impression', sessionManager.getSession().getId(), url);
            }
            sessionManager.sendStart(programmaticAdUnit);
        });
        programmaticAdUnit.onClose.subscribe(onClose);
        programmaticAdUnit.onSkip.subscribe(onClose);
        programmaticAdUnit.onRedirect.subscribe(openLink);

        return programmaticAdUnit;
    }
}
