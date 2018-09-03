import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { AndroidVideoEventHandler } from 'Ads/EventHandlers/AndroidVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IosVideoEventHandler } from 'Ads/EventHandlers/IosVideoEventHandler';
import { PrivacyEventHandler } from 'Ads/EventHandlers/PrivacyEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { ClosableVideoOverlay } from 'Ads/Views/ClosableVideoOverlay';
import { Closer } from 'Ads/Views/Closer';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { Overlay } from 'Ads/Views/Overlay';
import { Privacy } from 'Ads/Views/Privacy';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { StreamType } from 'Common/Constants/Android/StreamType';
import { Platform } from 'Common/Constants/Platform';
import { WebViewError } from 'Common/Errors/WebViewError';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { IObserver2, IObserver3 } from 'Common/Utilities/IObserver';
import { NewVideoOverlayEnabledAbTest } from 'Core/Models/ABGroup';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialEventHandler } from 'Display/EventHandlers/DisplayInterstitialEventHandler';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { PlayableMRAID } from 'MRAID/Views/PlayableMRAID';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { PromoAdUnit } from 'Promo/AdUnits/PromoAdUnit';
import { PromoEventHandler } from 'Promo/EventHandlers/PromoEventHandler';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { Promo } from 'Promo/Views/Promo';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDEndScreenEventHandler } from 'VPAID/EventHandlers/VPAIDEndScreenEventHandler';
import { VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDOverlayEventHandler } from 'VPAID/EventHandlers/VPAIDOverlayEventHandler';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { XPromoOverlayEventHandler } from 'XPromo/EventHandlers/XPromoOverlayEventHandler';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';

export class AdUnitFactory {
    private static _forcedPlayableMRAID: boolean = false;
    private static _forcedARMRAID: boolean = false;

    public static createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractAdUnit {

        Privacy.createBuildInformation(parameters.clientInfo, parameters.campaign, nativeBridge, parameters.configuration);

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
        } else if (parameters.campaign instanceof XPromoCampaign) {
            return this.createXPromoAdUnit(nativeBridge, <IAdUnitParameters<XPromoCampaign>>parameters);
        } else if (parameters.campaign instanceof AdMobCampaign) {
            return this.createAdMobAdUnit(nativeBridge, <IAdUnitParameters<AdMobCampaign>>parameters);
        } else if (parameters.campaign instanceof PromoCampaign) {
            return this.createPromoAdUnit(nativeBridge, <IAdUnitParameters<PromoCampaign>>parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    public static setForcedPlayableMRAID(value: boolean) {
        AdUnitFactory._forcedPlayableMRAID = value;
    }

    public static setForcedARMRAID(value: boolean) {
        AdUnitFactory._forcedARMRAID = value;
    }

    private static createPerformanceAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<PerformanceCampaign>): PerformanceAdUnit {
        const overlay = this.createOverlay(nativeBridge, parameters);

        const adUnitStyle: AdUnitStyle = parameters.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();

        const privacy = this.createPrivacy(nativeBridge, parameters);
        const endScreenParameters: IEndScreenParameters = {
            ... this.createEndScreenParameters(nativeBridge, privacy, parameters.campaign.getGameName(), parameters),
            adUnitStyle: adUnitStyle,
            campaignId: parameters.campaign.getId(),
            osVersion: parameters.deviceInfo.getOsVersion()
        };
        const endScreen = new PerformanceEndScreen(endScreenParameters, parameters.campaign);
        const video = this.getVideo(parameters.campaign, parameters.forceOrientation);

        const performanceAdUnitParameters: IPerformanceAdUnitParameters = {
            ... parameters,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            privacy: privacy
        };

        const performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        const performanceOverlayEventHandler = new PerformanceOverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        overlay.addEventHandler(performanceOverlayEventHandler);
        const endScreenEventHandler = new PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
        endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(nativeBridge, performanceAdUnit, video, performanceAdUnitParameters.adUnitStyle, performanceAdUnitParameters);
        this.prepareVideoPlayer(PerformanceVideoEventHandler, <IVideoEventHandlerParams<PerformanceAdUnit>>videoEventHandlerParams);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => endScreenEventHandler.onKeyEvent(keyCode));
            performanceAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }

        return performanceAdUnit;
    }

    private static createEndScreenParameters(nativeBridge: NativeBridge, privacy: AbstractPrivacy, targetGameName: string | undefined, parameters: IAdUnitParameters<Campaign>): IEndScreenParameters {
        const showGDPRBanner = this.showGDPRBanner(parameters);
        return {
            nativeBridge: nativeBridge,
            language: parameters.deviceInfo.getLanguage(),
            gameId: parameters.clientInfo.getGameId(),
            targetGameName: targetGameName,
            abGroup: parameters.configuration.getAbGroup(),
            privacy: privacy,
            showGDPRBanner: showGDPRBanner,
            adUnitStyle: undefined,
            campaignId: undefined,
            osVersion: undefined
        };
    }

    private static createXPromoAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<XPromoCampaign>): XPromoAdUnit {
        const overlay = this.createOverlay(nativeBridge, parameters);

        const privacy = this.createPrivacy(nativeBridge, parameters);
        const endScreenParameters = this.createEndScreenParameters(nativeBridge, privacy, parameters.campaign.getGameName(), parameters);
        const endScreen = new XPromoEndScreen(endScreenParameters, parameters.campaign);
        const video = this.getVideo(parameters.campaign, parameters.forceOrientation);

        const xPromoAdUnitParameters: IXPromoAdUnitParameters = {
            ... parameters,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            privacy: privacy
        };

        const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
        const xPromoOverlayEventHandler = new XPromoOverlayEventHandler(nativeBridge, xPromoAdUnit, xPromoAdUnitParameters);
        overlay.addEventHandler(xPromoOverlayEventHandler);
        const endScreenEventHandler = new XPromoEndScreenEventHandler(nativeBridge, xPromoAdUnit, xPromoAdUnitParameters);
        endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(nativeBridge, xPromoAdUnit, video, undefined, xPromoAdUnitParameters);
        this.prepareVideoPlayer(XPromoVideoEventHandler, <IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => endScreenEventHandler.onKeyEvent(keyCode));
            xPromoAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }

        return xPromoAdUnit;
    }

    private static createVastAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<VastCampaign>): VastAdUnit {
        const overlay = this.createOverlay(nativeBridge, parameters);
        let vastEndScreen: VastEndScreen | undefined;

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... parameters,
            video: parameters.campaign.getVideo(),
            overlay: overlay
        };

        if(parameters.campaign.hasEndscreen()) {
            vastEndScreen = new VastEndScreen(nativeBridge, parameters.configuration.isCoppaCompliant(), parameters.campaign, parameters.clientInfo.getGameId());
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const hasAdvertiserDomain = parameters.campaign.getAdvertiserDomain() !== undefined;
        if (hasAdvertiserDomain && parameters.campaign.isMoatEnabled()) {
            MoatViewabilityService.initMoat(nativeBridge, parameters.campaign, parameters.clientInfo, parameters.placement, parameters.deviceInfo, parameters.configuration);
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

        const vastOverlayHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
        overlay.addEventHandler(vastOverlayHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(nativeBridge, vastAdUnit, parameters.campaign.getVideo(), undefined, vastAdUnitParameters);
        const vastVideoEventHandler = this.prepareVideoPlayer(VastVideoEventHandler, <IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);

        let onVolumeChangeObserverAndroid: IObserver3<number, number, number>;
        let onVolumeChangeObserverIOS: IObserver2<number, number>;
        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.DeviceInfo.Android.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserverAndroid = nativeBridge.DeviceInfo.Android.onVolumeChanged.subscribe((streamType, volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.DeviceInfo.Ios.registerVolumeChangeListener();
            onVolumeChangeObserverIOS = nativeBridge.DeviceInfo.Ios.onVolumeChanged.subscribe((volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        }

        vastAdUnit.onClose.subscribe(() => {
            if(onVolumeChangeObserverAndroid) {
                nativeBridge.DeviceInfo.Android.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                nativeBridge.DeviceInfo.Android.onVolumeChanged.unsubscribe(onVolumeChangeObserverAndroid);
            }

            if(onVolumeChangeObserverIOS) {
                nativeBridge.DeviceInfo.Ios.unregisterVolumeChangeListener();
                nativeBridge.DeviceInfo.Ios.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });

        return vastAdUnit;
    }

    private static createMRAIDAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<MRAIDCampaign>): MRAIDAdUnit {
        const resourceUrl = parameters.campaign.getResourceUrl();

        let mraid: MRAIDView<IMRAIDViewHandler>;
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const privacy = this.createPrivacy(nativeBridge, parameters);
        if((resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) || AdUnitFactory._forcedPlayableMRAID) {
            mraid = new PlayableMRAID(nativeBridge, parameters.placement, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner, parameters.configuration.getAbGroup());
        } else if (ARUtil.isARCreative(parameters.campaign) || AdUnitFactory._forcedARMRAID) {
            mraid = new ARMRAID(nativeBridge, parameters.placement, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner, parameters.configuration.getAbGroup());
        } else {
            mraid = new MRAID(nativeBridge, parameters.placement, parameters.campaign, privacy, showGDPRBanner, parameters.configuration.getAbGroup());
        }

        const mraidAdUnitParameters: IMRAIDAdUnitParameters = {
            ... parameters,
            mraid: mraid,
            privacy: privacy
        };

        const mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
        const mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
        mraid.addEventHandler(mraidEventHandler);

        return mraidAdUnit;
    }

    private static createVPAIDAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<VPAIDCampaign>): AbstractAdUnit {
        // WebPlayerContainer will always be defined, checking and throwing just to remove the undefined type.
        if (!parameters.webPlayerContainer) {
            throw new Error('is undefined, should not get here.');
        }

        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const closer = new Closer(nativeBridge, parameters.placement, privacy, showGDPRBanner);
        const vpaid = new VPAID(nativeBridge, parameters.webPlayerContainer, parameters.campaign, parameters.placement);
        let endScreen: VPAIDEndScreen | undefined;

        const vpaidAdUnitParameters: IVPAIDAdUnitParameters = {
            ... parameters,
            vpaid: vpaid,
            closer: closer,
            privacy: privacy
        };

        if(parameters.campaign.hasEndScreen()) {
            endScreen = new VPAIDEndScreen(nativeBridge, parameters.campaign, parameters.clientInfo.getGameId());
            vpaidAdUnitParameters.endScreen = endScreen;
        }

        const vpaidAdUnit = new VPAIDAdUnit(nativeBridge, vpaidAdUnitParameters);

        const vpaidEventHandler = new VPAIDEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
        vpaid.addEventHandler(vpaidEventHandler);
        const overlayEventHandler = new VPAIDOverlayEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
        closer.addEventHandler(overlayEventHandler);

        if(parameters.campaign.hasEndScreen() && endScreen) {
            const endScreenEventHandler = new VPAIDEndScreenEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
            endScreen.addEventHandler(endScreenEventHandler);
        }

        return vpaidAdUnit;
    }

    private static createPromoAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<PromoCampaign>): AbstractAdUnit {
        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);

        const promoView = new Promo(nativeBridge, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner);
        const promoAdUnit = new PromoAdUnit(nativeBridge, {
            ...parameters,
            view: promoView,
            privacy: privacy
        });

        promoView.render();
        document.body.appendChild(promoView.container());

        promoView.onGDPRPopupSkipped.subscribe(() => PromoEventHandler.onGDPRPopupSkipped(parameters.configuration, parameters.gdprManager));
        promoView.onClose.subscribe(() => PromoEventHandler.onClose(promoAdUnit, parameters.configuration.getToken(), parameters.clientInfo.getGameId(), parameters.configuration.getAbGroup(), parameters.campaign.getTrackingUrlsForEvent('purchase'), parameters.configuration.isOptOutEnabled()));
        promoView.onPromo.subscribe((productId) => PromoEventHandler.onPromo(promoAdUnit, productId, parameters.campaign.getTrackingUrlsForEvent('purchase')));

        return promoAdUnit;
    }

    private static createDisplayInterstitialAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<DisplayInterstitialCampaign>): DisplayInterstitialAdUnit {

        const privacy = this.createPrivacy(nativeBridge, parameters);

        const view = new DisplayInterstitial(nativeBridge, parameters.placement, parameters.campaign, privacy, this.showGDPRBanner(parameters));
        const displayInterstitialParameters: IDisplayInterstitialAdUnitParameters = {
            ... parameters,
            view: view
        };

        const displayInterstitialAdUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialParameters);
        const displayInterstitialEventHandler = new DisplayInterstitialEventHandler(nativeBridge, displayInterstitialAdUnit, displayInterstitialParameters);
        view.addEventHandler(displayInterstitialEventHandler);

        return displayInterstitialAdUnit;
    }

    private static prepareVideoPlayer<T extends VideoEventHandler, T2 extends VideoAdUnit, T3 extends Campaign, T4 extends OperativeEventManager, ParamsType extends IVideoEventHandlerParams<T2, T3, T4>>(VideoEventHandlerConstructor: { new(p: ParamsType): T }, params: ParamsType): T {
        const nativeBridge = params.nativeBrige;
        const adUnit = params.adUnit;
        const videoEventHandler = new VideoEventHandlerConstructor(params);

        nativeBridge.VideoPlayer.addEventHandler(videoEventHandler);

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.removeEventHandler(videoEventHandler);
        });

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(params);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            this.prepareIosVideoPlayer(params);
        }

        return videoEventHandler;
    }

    private static prepareAndroidVideoPlayer(params: IVideoEventHandlerParams) {
        const nativeBridge = params.nativeBrige;
        const adUnit = params.adUnit;
        const androidVideoEventHandler = new AndroidVideoEventHandler(params);

        nativeBridge.VideoPlayer.Android.addEventHandler(androidVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.removeEventHandler(androidVideoEventHandler);
        });
    }

    private static prepareIosVideoPlayer(params: IVideoEventHandlerParams) {
        const nativeBridge = params.nativeBrige;
        const adUnit = params.adUnit;
        const iosVideoEventHandler = new IosVideoEventHandler(params);

        nativeBridge.VideoPlayer.Ios.addEventHandler(iosVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Ios.removeEventHandler(iosVideoEventHandler);
        });
    }

    private static createAdMobAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<AdMobCampaign>): AdMobAdUnit {
        // AdMobSignalFactory will always be defined, checking and throwing just to remove the undefined type.
        if (!parameters.adMobSignalFactory) {
            throw new Error('AdMobSignalFactory is undefined, should not get here.');
        }

        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const view = new AdMobView(nativeBridge, parameters.adMobSignalFactory, parameters.container, parameters.campaign, parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, parameters.programmaticTrackingService);
        view.render();

        const adUnitParameters: IAdMobAdUnitParameters = {
            ... parameters,
            view: view
        };
        const adUnit = new AdMobAdUnit(nativeBridge, adUnitParameters);

        const eventHandler = new AdMobEventHandler({
            nativeBridge: nativeBridge,
            adUnit: adUnit,
            request: parameters.request,
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            session: parameters.campaign.getSession(),
            adMobSignalFactory: parameters.adMobSignalFactory,
            campaign: parameters.campaign,
            clientInfo: parameters.clientInfo,
            configuration: parameters.configuration,
            gdprManager: parameters.gdprManager
        });
        view.addEventHandler(eventHandler);

        return adUnit;
    }

    private static createOverlay(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractVideoOverlay {
        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showGDPRBanner = (parameters.campaign instanceof VastCampaign) ? this.showGDPRBanner(parameters) : false;
        const isPerformanceCampaign = parameters.campaign instanceof PerformanceCampaign;
        const disablePrivacyDuringVideo = (isPerformanceCampaign || parameters.campaign instanceof XPromoCampaign) && !parameters.placement.skipEndCardOnClose();
        let overlay: AbstractVideoOverlay;

        if (parameters.placement.allowSkip() && parameters.placement.skipEndCardOnClose()) {
            overlay = new ClosableVideoOverlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        } else {
            if (NewVideoOverlayEnabledAbTest.isValid(parameters.configuration.getAbGroup())) {
                overlay = new NewVideoOverlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, disablePrivacyDuringVideo);
            } else {
                overlay = new Overlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, disablePrivacyDuringVideo);
            }
        }

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }

    private static getVideoEventHandlerParams(nativeBridge: NativeBridge, adUnit: VideoAdUnit, video: Video, adUnitStyle: AdUnitStyle | undefined, params: IAdUnitParameters<Campaign>): IVideoEventHandlerParams {
        return {
            nativeBrige: nativeBridge,
            adUnit: adUnit,
            campaign: params.campaign,
            operativeEventManager: params.operativeEventManager,
            thirdPartyEventManager: params.thirdPartyEventManager,
            configuration: params.configuration,
            placement: params.placement,
            video: video,
            adUnitStyle: adUnitStyle,
            clientInfo: params.clientInfo
        };
    }

    private static getVideo(campaign: Campaign, forceOrientation: Orientation): Video {
        const video = CampaignAssetInfo.getOrientedVideo(campaign, forceOrientation);
        if(!video) {
            throw new WebViewError('Unable to select an oriented video');
        }

        return video;
    }

    private static createPrivacy(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractPrivacy {
        let privacy: AbstractPrivacy;
        if (parameters.configuration.isGDPREnabled()) {
            privacy = new GDPRPrivacy(nativeBridge, parameters.gdprManager, parameters.configuration.isCoppaCompliant(), parameters.configuration.isOptOutEnabled());
        } else {
            privacy = new Privacy(nativeBridge, parameters.configuration.isCoppaCompliant());
        }
        const privacyEventHandler = new PrivacyEventHandler(nativeBridge, parameters);
        privacy.addEventHandler(privacyEventHandler);
        return privacy;
    }

    private static showGDPRBanner(parameters: IAdUnitParameters<Campaign>): boolean {
        return parameters.configuration.isGDPREnabled() ? !parameters.configuration.isOptOutRecorded() : false;
    }
}
