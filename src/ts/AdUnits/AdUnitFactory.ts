import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitialAdUnit } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
// import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
// import { VastOverlayEventHandlers } from 'EventHandlers/VastOverlayEventHandlers';
// import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
// import { VastEndScreenEventHandlers } from 'EventHandlers/VastEndScreenEventHandlers';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { EndScreen, IEndScreenHandler } from 'Views/EndScreen';
import { IVastEndScreenHandler, VastEndScreen } from 'Views/VastEndScreen';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { DeviceInfo } from 'Models/DeviceInfo';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { IOverlayHandler, Overlay } from 'Views/Overlay';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { IMRAIDViewHandler, MRAIDView } from 'Views/MRAIDView';
import { MRAID } from 'Views/MRAID';
import { PlayableMRAID } from 'Views/PlayableMRAID';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { FinishState } from 'Constants/FinishState';
import { Video } from 'Models/Assets/Video';
import { WebViewError } from 'Errors/WebViewError';
import { MRAIDEventHandlers } from 'EventHandlers/MRAIDEventHandlers';
import { Request } from 'Utilities/Request';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { EndScreenEventHandler } from 'EventHandlers/EndScreenEventHandler';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { PerformanceOverlayEventHandler } from 'EventHandlers/PerformanceOverlayEventHandler';
import { VastEndScreenEventHandler } from 'EventHandlers/VastEndScreenEventHandler';
import { VastOverlayEventHandler } from 'EventHandlers/VastOverlayEventHandler';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (parameters.campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, parameters);
        } else if(parameters.campaign instanceof MRAIDCampaign) {
            return this.createMRAIDAdUnit(nativeBridge, parameters.forceOrientation, parameters.container, parameters.deviceInfo, parameters.clientInfo, parameters.operativeEventManager, parameters.thirdPartyEventManager, parameters.placement, parameters.campaign, parameters.request, parameters.configuration, parameters.options);
        } else if(parameters.campaign instanceof PerformanceCampaign) {
            return this.createPerformanceAdUnit(nativeBridge, parameters);
        } else if (parameters.campaign instanceof DisplayInterstitialCampaign) {
            return this.createDisplayInterstitialAdUnit(nativeBridge, parameters.forceOrientation, parameters.container, parameters.deviceInfo, parameters.operativeEventManager, parameters.thirdPartyEventManager, parameters.placement, parameters.campaign, parameters.options);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createPerformanceAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters): AbstractAdUnit {
        const overlay = new Overlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        const endScreen = new EndScreen(nativeBridge, parameters.campaign, parameters.configuration.isCoppaCompliant(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());

        const video = this.getOrientedVideo(<PerformanceCampaign>parameters.campaign, parameters.forceOrientation);
        const performanceAdUnitParameters: IPerformanceAdUnitParameters<IEndScreenHandler, IOverlayHandler> = {
            ... parameters,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            endScreenEventHandler: EndScreenEventHandler,
            overlayEventHandler: OverlayEventHandler,
            performanceOverlayEventHandler: PerformanceOverlayEventHandler
        };

        const performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        this.prepareVideoPlayer(nativeBridge, parameters.container, parameters.operativeEventManager, parameters.thirdPartyEventManager, parameters.configuration, performanceAdUnit);

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => PerformanceVideoEventHandlers.onVideoCompleted(performanceAdUnit));
        const onVideoErrorObserver = performanceAdUnit.onError.subscribe(() => PerformanceVideoEventHandlers.onVideoError(performanceAdUnit));

        performanceAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            performanceAdUnit.onError.unsubscribe(onVideoErrorObserver);
        });

        return performanceAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters): AbstractAdUnit {
        const overlay = new Overlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        const campaign = <VastCampaign>parameters.campaign;
        let vastAdUnit: VastAdUnit;
        const vastAdUnitParameters: IVastAdUnitParameters<IVastEndScreenHandler, IOverlayHandler> = {
            ... parameters,
            video: campaign.getVideo(),
            overlay: overlay,
            endScreenEventHandler: VastEndScreenEventHandler,
            overlayEventHandler: OverlayEventHandler,
            vastOverlayEventHandler: VastOverlayEventHandler
        };

        if (campaign.hasEndscreen()) {
            const vastEndScreen = new VastEndScreen(nativeBridge, campaign, parameters.clientInfo.getGameId());
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            // this.prepareVastEndScreen(vastEndScreen, nativeBridge, parameters.thirdPartyEventManager, vastAdUnit, parameters.deviceInfo, parameters.clientInfo, parameters.request);
        } else {
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
        }

        // this.prepareOverlay(overlay, nativeBridge, parameters.operativeEventManager, vastAdUnit);
        // overlay.setSpinnerEnabled(!campaign.getVideo().isCached());

        // this.prepareVastOverlayEventHandlers(overlay, nativeBridge, parameters.thirdPartyEventManager, vastAdUnit, parameters.request, parameters.clientInfo);
        this.prepareVideoPlayer(nativeBridge, parameters.container, parameters.operativeEventManager, parameters.thirdPartyEventManager, parameters.configuration, vastAdUnit);

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(parameters.thirdPartyEventManager, vastAdUnit, parameters.clientInfo));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VastVideoEventHandlers.onVideoStart(parameters.thirdPartyEventManager, vastAdUnit, parameters.clientInfo));
        const onVideoErrorObserver = vastAdUnit.onError.subscribe(() => VastVideoEventHandlers.onVideoError(vastAdUnit));

        vastAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            vastAdUnit.onError.unsubscribe(onVideoErrorObserver);
        });

        return vastAdUnit;
    }

    private static createMRAIDAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, clientInfo: ClientInfo, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, placement: Placement, campaign: MRAIDCampaign, request: Request, configuration: Configuration, options: any): AbstractAdUnit {
        let mraid: MRAIDView<IMRAIDViewHandler>;
        const resourceUrl = campaign.getResourceUrl();
        let endScreen: EndScreen | undefined;
        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity|roll-the-ball/)) {
            mraid = new PlayableMRAID(nativeBridge, placement, campaign, deviceInfo.getLanguage());
        } else {
            mraid = new MRAID(nativeBridge, placement, campaign);
        }

        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) {
            endScreen = new EndScreen(nativeBridge, campaign, configuration.isCoppaCompliant(), deviceInfo.getLanguage(), clientInfo.getGameId());
        }

        const mraidAdUnit = new MRAIDAdUnit(nativeBridge, container, clientInfo, operativeEventManager, thirdPartyEventManager, placement, campaign, mraid, options, endScreen);

        mraid.render();
        document.body.appendChild(mraid.container());

        mraid.onClick.subscribe((url) => MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, operativeEventManager, thirdPartyEventManager, request, url));

        mraid.onReward.subscribe(() => {
            operativeEventManager.sendThirdQuartile(mraidAdUnit);
        });

        mraid.onAnalyticsEvent.subscribe((timeFromShow, timeFromPlayableStart, event, eventData) => MRAIDEventHandlers.onAnalyticsEvent(campaign, timeFromShow, timeFromPlayableStart, event, eventData));
        if(endScreen) {
            this.prepareEndScreen(endScreen, nativeBridge, operativeEventManager, thirdPartyEventManager, mraidAdUnit, deviceInfo, clientInfo);
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

    /*
    private static prepareOverlay(overlay: Overlay, nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, adUnit: VideoAdUnit) {
        overlay.render();
        document.body.appendChild(overlay.container());

        if(!adUnit.getPlacement().allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(adUnit.getPlacement().allowSkipInSeconds());
        }

        // overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, operativeEventManager, adUnit));
        // overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, muted));
    }*/
/*
    private static prepareVastOverlayEventHandlers(overlay: Overlay, nativeBridge: NativeBridge, thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, request: Request, clientInfo: ClientInfo) {
        // overlay.onSkip.subscribe((videoProgress) => VastOverlayEventHandlers.onSkip(adUnit));
        // overlay.onCallButton.subscribe(() => VastOverlayEventHandlers.onCallButton(nativeBridge, thirdPartyEventManager, adUnit, request, clientInfo));
        // overlay.onMute.subscribe((muted) => VastOverlayEventHandlers.onMute(thirdPartyEventManager, adUnit, muted, clientInfo));
    }*/

    private static prepareEndScreen(endScreen: EndScreen, nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, adUnit: AbstractAdUnit, deviceInfo: DeviceInfo, clientInfo: ClientInfo) {
        /*
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onPrivacy.subscribe((url) => EndScreenEventHandlers.onPrivacy(nativeBridge, url));
        endScreen.onClose.subscribe(() => EndScreenEventHandlers.onClose(adUnit));

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownloadAndroid(nativeBridge, operativeEventManager, thirdPartyEventManager, adUnit, clientInfo));
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => EndScreenEventHandlers.onKeyEvent(keyCode, adUnit));
            adUnit.onClose.subscribe(() => {
                nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
            });
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownloadIos(nativeBridge, operativeEventManager, thirdPartyEventManager, adUnit, deviceInfo, clientInfo));
        }*/
    }

    /*
    private static prepareVastEndScreen(endScreen: VastEndScreen, nativeBridge: NativeBridge, thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, deviceInfo: DeviceInfo, clientInfo: ClientInfo, request: Request) {
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onClose.subscribe(() => VastEndScreenEventHandlers.onClose(adUnit));
        endScreen.onShow.subscribe(() => VastEndScreenEventHandlers.onShow(thirdPartyEventManager, adUnit, clientInfo));

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            endScreen.onClick.subscribe(() => VastEndScreenEventHandlers.onClick(nativeBridge, adUnit, request, thirdPartyEventManager, clientInfo));
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => EndScreenEventHandlers.onKeyEvent(keyCode, adUnit));
            adUnit.onClose.subscribe(() => {
                nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
            });
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            endScreen.onClick.subscribe(() => VastEndScreenEventHandlers.onClick(nativeBridge, adUnit, request, thirdPartyEventManager, clientInfo));
        }
    }*/

    private static prepareVideoPlayer(nativeBridge: NativeBridge, container: AdUnitContainer, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, configuration: Configuration, adUnit: VideoAdUnit) {
        const onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((url, duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, duration));
        const onPrepareTimeoutObserver = nativeBridge.VideoPlayer.onPrepareTimeout.subscribe((url) => VideoEventHandlers.onVideoPrepareTimeout(nativeBridge, adUnit, url));
        const onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, adUnit, position, configuration));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoPlay(nativeBridge, adUnit));
        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(operativeEventManager, adUnit));

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

    private static createDisplayInterstitialAdUnit(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, deviceInfo: DeviceInfo, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, placement: Placement, campaign: DisplayInterstitialCampaign, options: any): AbstractAdUnit {
        const view = new DisplayInterstitial(nativeBridge, placement, campaign);
        const programmaticAdUnit = new DisplayInterstitialAdUnit(nativeBridge, container, operativeEventManager, placement, campaign, view, options);

        view.render();
        document.body.appendChild(view.container());

        const onClose = () => {
            operativeEventManager.sendThirdQuartile(programmaticAdUnit);
            operativeEventManager.sendView(programmaticAdUnit);
            programmaticAdUnit.hide();
        };

        const isWhiteListedLinkType = (href: string) => {
            const whiteListedProtocols = ['http', 'market', 'itunes'];
            for (const protocol of whiteListedProtocols) {
                if (href.indexOf(protocol) === 0) {
                    return true;
                }
            }
            return false;
        };

        const openLink = (href: string) => {
            operativeEventManager.sendClick(programmaticAdUnit);

            for (let url of campaign.getTrackingUrlsForEvent('click')) {
                url = url.replace(/%ZONE%/, placement.getId());
                url = url.replace(/%SDK_VERSION%/, operativeEventManager.getClientInfo().getSdkVersion().toString());
                thirdPartyEventManager.sendEvent('display click', campaign.getSession().getId(), url);
            }

            if (isWhiteListedLinkType(href)) {
                if(nativeBridge.getPlatform() === Platform.ANDROID) {
                    nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': href
                    });
                } else {
                    nativeBridge.UrlScheme.open(href);
                }
            }
        };

        programmaticAdUnit.onStart.subscribe(() => {
            for (let url of campaign.getTrackingUrlsForEvent('impression')) {
                url = url.replace(/%ZONE%/, placement.getId());
                url = url.replace(/%SDK_VERSION%/, operativeEventManager.getClientInfo().getSdkVersion().toString());
                thirdPartyEventManager.sendEvent('display impression', campaign.getSession().getId(), url);
            }
            operativeEventManager.sendStart(programmaticAdUnit);
        });
        programmaticAdUnit.onClose.subscribe(onClose);
        programmaticAdUnit.onSkip.subscribe(onClose);
        programmaticAdUnit.onRedirect.subscribe(openLink);

        return programmaticAdUnit;
    }
}
