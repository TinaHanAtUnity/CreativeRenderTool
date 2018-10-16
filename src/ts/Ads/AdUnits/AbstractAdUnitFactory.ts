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
import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export abstract class AbstractAdUnitFactory {
    private static _forceGDPRBanner: boolean = false;

    public abstract createAdUnit(parameters: IAdUnitParameters<Campaign>): AbstractAdUnit;

    public static setForcedGDPRBanner(value: boolean) {
        AbstractAdUnitFactory._forceGDPRBanner = value;
    }

    protected createEndScreenParameters(privacy: AbstractPrivacy, targetGameName: string | undefined, parameters: IAdUnitParameters<Campaign>): IEndScreenParameters {
        const showGDPRBanner = this.showGDPRBanner(parameters);
        return {
            platform: parameters.platform,
            core: parameters.core,
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
        const adUnit = params.adUnit;
        const videoEventHandler = new VideoEventHandlerConstructor(params);

        params.ads.VideoPlayer.addEventHandler(videoEventHandler);

        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.removeEventHandler(videoEventHandler);
        });

        if (params.platform === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(params);
        } else if(params.platform === Platform.IOS) {
            this.prepareIosVideoPlayer(params);
        }

        return videoEventHandler;
    }

    protected prepareAndroidVideoPlayer(params: IVideoEventHandlerParams) {
        const adUnit = params.adUnit;
        const androidVideoEventHandler = new AndroidVideoEventHandler(params);

        params.ads.VideoPlayer.Android!.addEventHandler(androidVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.Android!.removeEventHandler(androidVideoEventHandler);
        });
    }

    protected prepareIosVideoPlayer(params: IVideoEventHandlerParams) {
        const adUnit = params.adUnit;
        const iosVideoEventHandler = new IosVideoEventHandler(params);

        params.ads.VideoPlayer.iOS!.addEventHandler(iosVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.iOS!.removeEventHandler(iosVideoEventHandler);
        });
    }

    protected createOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy, showPrivacyDuringVideo: boolean | undefined): AbstractVideoOverlay {
        const showGDPRBanner = (parameters.campaign instanceof VastCampaign) ? this.showGDPRBanner(parameters) : false;
        let overlay: AbstractVideoOverlay;

        if (parameters.placement.allowSkip() && parameters.placement.skipEndCardOnClose()) {
            overlay = new ClosableVideoOverlay(parameters.platform, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId());
        } else {
            overlay = new NewVideoOverlay(parameters.platform, parameters.ads, parameters.placement.muteVideo(), parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, showPrivacyDuringVideo, parameters.campaign.getSeatId());
        }

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }

    protected getVideoEventHandlerParams(adUnit: VideoAdUnit, video: Video, adUnitStyle: AdUnitStyle | undefined, params: IAdUnitParameters<Campaign>): IVideoEventHandlerParams {
        return {
            platform: params.platform,
            adUnit: adUnit,
            campaign: params.campaign,
            operativeEventManager: params.operativeEventManager,
            thirdPartyEventManager: params.thirdPartyEventManager,
            coreConfig: params.coreConfig,
            adsConfig: params.adsConfig,
            placement: params.placement,
            video: video,
            adUnitStyle: adUnitStyle,
            clientInfo: params.clientInfo,
            core: params.core,
            ads: params.ads
        };
    }

    protected getVideo(campaign: Campaign, forceOrientation: Orientation): Video {
        const video = CampaignAssetInfo.getOrientedVideo(campaign, forceOrientation);
        if(!video) {
            throw new WebViewError('Unable to select an oriented video');
        }
        return video;
    }

    protected createPrivacy(parameters: IAdUnitParameters<Campaign>): Privacy {
        const privacy = new Privacy(parameters.platform, parameters.campaign, parameters.gdprManager, parameters.adsConfig.isGDPREnabled(), parameters.coreConfig.isCoppaCompliant());
        const privacyEventHandler = new PrivacyEventHandler(parameters);
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
