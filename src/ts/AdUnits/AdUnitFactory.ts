import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Overlay } from 'Views/Overlay';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { IMRAIDViewHandler, MRAIDView } from 'Views/MRAIDView';
import { MRAID } from 'Views/MRAID';
import { PlayableMRAID } from 'Views/PlayableMRAID';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { StreamType } from 'Constants/Android/StreamType';
import { Video } from 'Models/Assets/Video';
import { WebViewError } from 'Errors/WebViewError';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { VPAID } from 'Views/VPAID';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { PerformanceOverlayEventHandler } from 'EventHandlers/PerformanceOverlayEventHandler';
import { VastEndScreenEventHandler } from 'EventHandlers/VastEndScreenEventHandler';
import { VastOverlayEventHandler } from 'EventHandlers/VastOverlayEventHandler';
import { VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { VPAIDEndScreenEventHandler } from 'EventHandlers/VPAIDEndScreenEventHandler';
import { VPAIDEventHandler } from 'EventHandlers/VPAIDEventHandler';
import { VPAIDOverlayEventHandler } from 'EventHandlers/VPAIDOverlayEventHandler';
import { MRAIDEventHandler } from 'EventHandlers/MRAIDEventHandler';
import { DisplayInterstitialEventHandler } from 'EventHandlers/DisplayInterstitialEventHandler';
import { Campaign } from 'Models/Campaign';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { MRAIDEndScreen } from 'Views/MRAIDEndScreen';
import { MRAIDEndScreenEventHandler } from 'EventHandlers/MRAIDEndScreenEventHandler';
import { PerformanceEndScreenEventHandler } from 'EventHandlers/PerformanceEndScreenEventHandler';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { InterstitialOverlay } from 'Views/InterstitialOverlay';
import { AbstractOverlay } from 'Views/AbstractOverlay';
import { CustomFeatures } from 'Utilities/CustomFeatures';

export class AdUnitFactory {

    public static createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractAdUnit {
        // todo: select ad unit based on placement
        if (parameters.campaign instanceof VastCampaign) {
            return this.createVastAdUnit(nativeBridge, <IAdUnitParameters<VastCampaign>>parameters);
        } else if(parameters.campaign instanceof MRAIDCampaign) {
            return this.createMRAIDAdUnit(nativeBridge, <IAdUnitParameters<MRAIDCampaign>>parameters);
        } else if(parameters.campaign instanceof PerformanceCampaign) {
            return this.createPerformanceAdUnit(nativeBridge, <IAdUnitParameters<PerformanceCampaign>>parameters);
        } else if (parameters.campaign instanceof DisplayInterstitialCampaign) {
            return this.createDisplayInterstitialAdUnit(nativeBridge, <IAdUnitParameters<DisplayInterstitialCampaign>>parameters);
        } else if (parameters.campaign instanceof VPAIDCampaign) {
            return this.createVPAIDAdUnit(nativeBridge, <IAdUnitParameters<VPAIDCampaign>>parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createPerformanceAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<PerformanceCampaign>): PerformanceAdUnit {
        const overlay = this.createOverlay(nativeBridge, parameters);
        const endScreen = new PerformanceEndScreen(nativeBridge, parameters.campaign, parameters.configuration.isCoppaCompliant(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        const video = this.getOrientedVideo(<PerformanceCampaign>parameters.campaign, parameters.forceOrientation);

        const performanceAdUnitParameters: IPerformanceAdUnitParameters = {
            ... parameters,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
        };

        const performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        const performanceOverlayEventHandler = new PerformanceOverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        overlay.addEventHandler(performanceOverlayEventHandler);
        const endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        endScreen.addEventHandler(endScreenEventHandler);

        this.prepareVideoPlayer(nativeBridge, performanceAdUnit, parameters);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => endScreenEventHandler.onKeyEvent(keyCode));
            performanceAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }

        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => PerformanceVideoEventHandlers.onVideoCompleted(performanceAdUnit));
        const onVideoErrorObserver = performanceAdUnit.onError.subscribe(() => PerformanceVideoEventHandlers.onVideoError(performanceAdUnit));
        performanceAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            performanceAdUnit.onError.unsubscribe(onVideoErrorObserver);
        });

        return performanceAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<VastCampaign>): VastAdUnit {
        const overlay = this.createOverlay(nativeBridge, parameters);
        let vastEndScreen: VastEndScreen | undefined;

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... parameters,
            video: parameters.campaign.getVideo(),
            overlay: overlay,
        };

        if(parameters.campaign.hasEndscreen()) {
            vastEndScreen = new VastEndScreen(nativeBridge, parameters.campaign, parameters.clientInfo.getGameId());
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);

        if(parameters.campaign.hasEndscreen() && vastEndScreen) {
            const vastEndScreenHandler = new VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
            vastEndScreen.addEventHandler(vastEndScreenHandler);

            if (nativeBridge.getPlatform() === Platform.ANDROID) {
                const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => vastEndScreenHandler.onKeyEvent(keyCode));
                vastAdUnit.onClose.subscribe(() => {
                    nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                });
            }
        }

        const campaign = parameters.campaign;
        const hasAdvertiserDomain = campaign.getAdvertiserDomain() !== undefined;
        if (hasAdvertiserDomain) {
            vastAdUnit.initMoat();
        }

        const moatIds = {
            level1: campaign.getAdvertiserDomain(),
            level2: campaign.getAdvertiserCampaignId(),
            level3: campaign.getCreativeId(),
            slicer1: parameters.clientInfo.getApplicationName(),
            slicer2: parameters.placement.getName()
        };

        const moatData = {
            SDK: 'UnityAds',
            Version: '1.0',
            SDKVersion: parameters.clientInfo.getSdkVersionName(),
            IFA: parameters.deviceInfo.getAdvertisingIdentifier(),
            LimitAdTracking: parameters.deviceInfo.getLimitAdTracking(),
            COPPA: parameters.configuration.isCoppaCompliant(),
            bundle: parameters.clientInfo.getApplicationName()
        };

        const vastOverlayHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
        overlay.addEventHandler(vastOverlayHandler);

        this.prepareVideoPlayer(nativeBridge, vastAdUnit, parameters);

        const onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((url, duration, width, height) => VastVideoEventHandlers.onVideoPrepared(vastAdUnit, url, duration, moatData, moatIds));
        const onPauseObserver = nativeBridge.VideoPlayer.onPause.subscribe(() => VastVideoEventHandlers.onVideoPaused(vastAdUnit));
        const onStopObserver = nativeBridge.VideoPlayer.onStop.subscribe(() => VastVideoEventHandlers.onVideoStopped(vastAdUnit));
        const onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VastVideoEventHandlers.onVideoProgress(vastAdUnit, position));
        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VastVideoEventHandlers.onVideoCompleted(parameters.thirdPartyEventManager, vastAdUnit, parameters.clientInfo, parameters.campaign.getSession()));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VastVideoEventHandlers.onVideoStart(parameters.thirdPartyEventManager, vastAdUnit, parameters.clientInfo, parameters.campaign.getSession()));
        const onVideoErrorObserver = vastAdUnit.onError.subscribe(() => VastVideoEventHandlers.onVideoError(vastAdUnit));

        let onVolumeChangeObserver: any;
        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.DeviceInfo.Android.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserver = nativeBridge.DeviceInfo.Android.onVolumeChanged.subscribe((streamType, volume, maxVolume) => VastVideoEventHandlers.onVolumeChange(vastAdUnit, volume, maxVolume));
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.DeviceInfo.Ios.registerVolumeChangeListener();
            onVolumeChangeObserver = nativeBridge.DeviceInfo.Ios.onVolumeChanged.subscribe((volume, maxVolume) => VastVideoEventHandlers.onVolumeChange(vastAdUnit, volume, maxVolume));
        }

        vastAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onPause.unsubscribe(onPauseObserver);
            nativeBridge.VideoPlayer.onStop.unsubscribe(onStopObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            if(onVolumeChangeObserver) {
                if(nativeBridge.getPlatform() === Platform.ANDROID) {
                    nativeBridge.DeviceInfo.Android.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                    nativeBridge.DeviceInfo.Android.onVolumeChanged.unsubscribe(onVolumeChangeObserver);
                } else if(nativeBridge.getPlatform() === Platform.IOS) {
                    nativeBridge.DeviceInfo.Ios.unregisterVolumeChangeListener();
                    nativeBridge.DeviceInfo.Ios.onVolumeChanged.unsubscribe(onVolumeChangeObserver);
                }
            }
            vastAdUnit.onError.unsubscribe(onVideoErrorObserver);
        });

        return vastAdUnit;
    }

    private static createMRAIDAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<MRAIDCampaign>): MRAIDAdUnit {
        const resourceUrl = parameters.campaign.getResourceUrl();
        let endScreen: MRAIDEndScreen | undefined;

        let mraid: MRAIDView<IMRAIDViewHandler>;
        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity|roll-the-ball/)) {
            mraid = new PlayableMRAID(nativeBridge, parameters.placement, parameters.campaign, parameters.deviceInfo.getLanguage());
        } else {
            mraid = new MRAID(nativeBridge, parameters.placement, parameters.campaign);
        }

        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) {
            endScreen = new MRAIDEndScreen(nativeBridge, parameters.campaign, parameters.configuration.isCoppaCompliant(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        }

        const mraidAdUnitParameters: IMRAIDAdUnitParameters = {
            ... parameters,
            mraid: mraid,
            endScreen: endScreen
        };

        const mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
        const mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
        mraid.addEventHandler(mraidEventHandler);

        if(endScreen) {
            const endScreenEventHandler = new MRAIDEndScreenEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
            endScreen.addEventHandler(endScreenEventHandler);
        }

        return mraidAdUnit;
    }

    private static createVPAIDAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<VPAIDCampaign>): VPAIDAdUnit {
        const overlay = this.createOverlay(nativeBridge, parameters);
        const vpaid = new VPAID(nativeBridge, <VPAIDCampaign>parameters.campaign, parameters.placement, parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        let endScreen: VPAIDEndScreen | undefined;

        const vpaidAdUnitParameters: IVPAIDAdUnitParameters = {
            ... parameters,
            vpaid: vpaid,
            overlay: overlay,
        };

        if(parameters.campaign.hasEndScreen()) {
            endScreen = new VPAIDEndScreen(nativeBridge, parameters.campaign, parameters.clientInfo.getGameId());
            vpaidAdUnitParameters.endScreen = endScreen;
        }

        const vpaidAdUnit = new VPAIDAdUnit(nativeBridge, vpaidAdUnitParameters);

        const vpaidEventHandler = new VPAIDEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
        vpaid.addEventHandler(vpaidEventHandler);
        const overlayEventHandler = new VPAIDOverlayEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
        overlay.addEventHandler(overlayEventHandler);

        if(parameters.campaign.hasEndScreen() && endScreen) {
            const endScreenEventHandler = new VPAIDEndScreenEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
            endScreen.addEventHandler(endScreenEventHandler);
        }

        return vpaidAdUnit;
    }

    private static createDisplayInterstitialAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<DisplayInterstitialCampaign>): DisplayInterstitialAdUnit {
        const view = new DisplayInterstitial(nativeBridge, parameters.placement, <DisplayInterstitialCampaign>parameters.campaign);

        const displayInterstitialParameters: IDisplayInterstitialAdUnitParameters = {
            ... parameters,
            view: view,
        };

        const displayInterstitialAdUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialParameters);
        const displayInterstitialEventHandler = new DisplayInterstitialEventHandler(nativeBridge, displayInterstitialAdUnit, displayInterstitialParameters);
        view.addEventHandler(displayInterstitialEventHandler);

        return displayInterstitialAdUnit;
    }

    private static prepareVideoPlayer(nativeBridge: NativeBridge, adUnit: VideoAdUnit, parameters: IAdUnitParameters<Campaign>) {
        const onPreparedObserver = nativeBridge.VideoPlayer.onPrepared.subscribe((url, duration, width, height) => VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, duration, parameters.campaign));
        const onPrepareTimeoutObserver = nativeBridge.VideoPlayer.onPrepareTimeout.subscribe((url) => VideoEventHandlers.onVideoPrepareTimeout(nativeBridge, adUnit, parameters.campaign, url));
        const onProgressObserver = nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(nativeBridge, parameters.operativeEventManager, parameters.thirdPartyEventManager, parameters.comScoreTrackingService, adUnit, position, parameters.configuration, parameters.campaign, parameters.placement));
        const onPlayObserver = nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoPlay(nativeBridge, adUnit));
        const onCompletedObserver = nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(parameters.operativeEventManager, parameters.comScoreTrackingService, adUnit, parameters.campaign));

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.onPrepared.unsubscribe(onPreparedObserver);
            nativeBridge.VideoPlayer.onPrepareTimeout.unsubscribe(onPrepareTimeoutObserver);
            nativeBridge.VideoPlayer.onProgress.unsubscribe(onProgressObserver);
            nativeBridge.VideoPlayer.onPlay.unsubscribe(onPlayObserver);
            nativeBridge.VideoPlayer.onCompleted.unsubscribe(onCompletedObserver);
        });

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(nativeBridge, adUnit, parameters);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.prepareIosVideoPlayer(nativeBridge, adUnit, parameters);
        }
    }

    private static prepareAndroidVideoPlayer(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, parameters: IAdUnitParameters<Campaign>) {
        const onGenericErrorObserver = nativeBridge.VideoPlayer.Android.onGenericError.subscribe((url, what, extra) => VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnit, parameters.campaign, what, extra, url));
        const onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Android.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, parameters.campaign, url));
        const onVideoSeekToErrorObserver = nativeBridge.VideoPlayer.Android.onSeekToError.subscribe((url) => VideoEventHandlers.onSeekToError(nativeBridge, videoAdUnit, parameters.campaign, url));
        const onVideoPauseErrorObserver = nativeBridge.VideoPlayer.Android.onPauseError.subscribe((url) => VideoEventHandlers.onPauseError(nativeBridge, videoAdUnit, parameters.campaign, url));
        const onVideoIllegalStateErrorObserver = nativeBridge.VideoPlayer.Android.onIllegalStateError.subscribe(() => VideoEventHandlers.onIllegalStateError(nativeBridge, videoAdUnit, parameters.campaign));

        videoAdUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.onGenericError.unsubscribe(onGenericErrorObserver);
            nativeBridge.VideoPlayer.Android.onPrepareError.unsubscribe(onVideoPrepareErrorObserver);
            nativeBridge.VideoPlayer.Android.onSeekToError.unsubscribe(onVideoSeekToErrorObserver);
            nativeBridge.VideoPlayer.Android.onPauseError.unsubscribe(onVideoPauseErrorObserver);
            nativeBridge.VideoPlayer.Android.onIllegalStateError.unsubscribe(onVideoIllegalStateErrorObserver);
        });
    }

    private static prepareIosVideoPlayer(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, parameters: IAdUnitParameters<Campaign>) {
        const onGenericErrorObserver = nativeBridge.VideoPlayer.Ios.onGenericError.subscribe((url, description) => VideoEventHandlers.onIosGenericVideoError(nativeBridge, videoAdUnit, parameters.campaign, url, description));
        const onVideoPrepareErrorObserver = nativeBridge.VideoPlayer.Ios.onPrepareError.subscribe((url) => VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnit, parameters.campaign, url));
        const onLikelyToKeepUpObserver = nativeBridge.VideoPlayer.Ios.onLikelyToKeepUp.subscribe((url, likelyToKeepUp) => VideoEventHandlers.onIosVideoLikelyToKeepUp(nativeBridge, videoAdUnit, parameters.container, likelyToKeepUp));

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

    private static createOverlay(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractOverlay {
        if(!parameters.placement.allowSkip()) {
            return new Overlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        } else {
            let overlay: AbstractOverlay;

            // Scopely's game IDs
            const enabledGameIds = ['15334',
                '15333',
                '24447',
                '11595',
                '11591',
                '1178487',
                '50650',
                '130204',
                '1413314',
                '1307778',
                '1413315',
                '130205',
                '24446',
                '17671',
                '130854',
                '1307777',
                '1495013'];

            if(enabledGameIds.indexOf(parameters.clientInfo.getGameId()) !== -1) {
                overlay = new InterstitialOverlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
            } else {
                overlay = new Overlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
            }

            if(CustomFeatures.isFadeDisabled(parameters.clientInfo.getGameId())) {
                overlay.setFadeEnabled(false);
            }
            return overlay;
        }
    }
}
