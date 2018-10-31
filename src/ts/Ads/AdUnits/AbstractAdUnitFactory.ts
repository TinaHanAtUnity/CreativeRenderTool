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
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { ClosableVideoOverlay } from 'Ads/Views/ClosableVideoOverlay';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { PerformanceVideoOverlayCTAButtonTest } from 'Core/Models/ABGroup';
import { PerformanceVideoOverlayWithCTAButton } from 'Ads/Views/PerformanceVideoOverlayWithCTAButton';

export abstract class AbstractAdUnitFactory {

    private static _forceGDPRBanner: boolean = false;

    public abstract createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractAdUnit;

    public static setForcedGDPRBanner(value: boolean) {
        AbstractAdUnitFactory._forceGDPRBanner = value;
    }

    protected createEndScreenParameters(nativeBridge: NativeBridge, privacy: AbstractPrivacy, targetGameName: string | undefined, parameters: IAdUnitParameters<Campaign>): IEndScreenParameters {
        const showGDPRBanner = this.showGDPRBanner(parameters);
        return {
            nativeBridge: nativeBridge,
            language: parameters.deviceInfo.getLanguage(),
            gameId: parameters.clientInfo.getGameId(),
            targetGameName: targetGameName,
            abGroup: parameters.coreConfig.getAbGroup(),
            privacy: privacy,
            showGDPRBanner: showGDPRBanner,
            adUnitStyle: undefined,
            campaignId: undefined,
            osVersion: undefined
        };
    }

    protected prepareVideoPlayer<T extends VideoEventHandler, T2 extends VideoAdUnit, T3 extends Campaign, T4 extends OperativeEventManager, ParamsType extends IVideoEventHandlerParams<T2, T3, T4>>(VideoEventHandlerConstructor: { new(p: ParamsType): T }, params: ParamsType): T {
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

    protected prepareAndroidVideoPlayer(params: IVideoEventHandlerParams) {
        const nativeBridge = params.nativeBrige;
        const adUnit = params.adUnit;
        const androidVideoEventHandler = new AndroidVideoEventHandler(params);

        nativeBridge.VideoPlayer.Android.addEventHandler(androidVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Android.removeEventHandler(androidVideoEventHandler);
        });
    }

    protected prepareIosVideoPlayer(params: IVideoEventHandlerParams) {
        const nativeBridge = params.nativeBrige;
        const adUnit = params.adUnit;
        const iosVideoEventHandler = new IosVideoEventHandler(params);

        nativeBridge.VideoPlayer.Ios.addEventHandler(iosVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            nativeBridge.VideoPlayer.Ios.removeEventHandler(iosVideoEventHandler);
        });
    }

    protected createOverlay(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy, showPrivacyDuringVideo: boolean | undefined): AbstractVideoOverlay {
        const showGDPRBanner = (parameters.campaign instanceof VastCampaign) ? this.showGDPRBanner(parameters) : false;
        let overlay: AbstractVideoOverlay;

        const skipAllowed = parameters.placement.allowSkip();
        const CTAButtonTestEnabled = PerformanceVideoOverlayCTAButtonTest.isValid(parameters.coreConfig.getAbGroup());
        const isPerformanceCampaign = parameters.campaign instanceof PerformanceCampaign;
        if (skipAllowed && parameters.placement.skipEndCardOnClose()) {
            overlay = new ClosableVideoOverlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        } else if (skipAllowed && isPerformanceCampaign && CTAButtonTestEnabled) {
            overlay = new PerformanceVideoOverlayWithCTAButton(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, <PerformanceCampaign>parameters.campaign, showPrivacyDuringVideo, parameters.campaign.getSeatId());
        } else {
            overlay = new NewVideoOverlay(nativeBridge, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, showPrivacyDuringVideo, parameters.campaign.getSeatId());
        }

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }

    protected getVideoEventHandlerParams(nativeBridge: NativeBridge, adUnit: VideoAdUnit, video: Video, adUnitStyle: AdUnitStyle | undefined, params: IAdUnitParameters<Campaign>): IVideoEventHandlerParams {
        return {
            nativeBrige: nativeBridge,
            adUnit: adUnit,
            campaign: params.campaign,
            operativeEventManager: params.operativeEventManager,
            thirdPartyEventManager: params.thirdPartyEventManager,
            coreConfig: params.coreConfig,
            adsConfig: params.adsConfig,
            placement: params.placement,
            video: video,
            adUnitStyle: adUnitStyle,
            clientInfo: params.clientInfo
        };
    }

    protected getVideo(campaign: Campaign, forceOrientation: Orientation): Video {
        const video = CampaignAssetInfo.getOrientedVideo(campaign, forceOrientation);
        if(!video) {
            throw new WebViewError('Unable to select an oriented video');
        }

        return video;
    }

    protected createPrivacy(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): Privacy {
        const privacy = new Privacy(nativeBridge, parameters.campaign, parameters.gdprManager, parameters.adsConfig.isGDPREnabled(), parameters.coreConfig.isCoppaCompliant());
        const privacyEventHandler = new PrivacyEventHandler(nativeBridge, parameters);
        privacy.addEventHandler(privacyEventHandler);
        return privacy;
    }

    protected showGDPRBanner(parameters: IAdUnitParameters<Campaign>): boolean {
        if (AbstractAdUnitFactory._forceGDPRBanner) {
            return true;
        }

        return parameters.adsConfig.isGDPREnabled() ? !parameters.adsConfig.isOptOutRecorded() : false;
    }
}
