import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IPerformanceAdUnitParameters } from 'Performance/AdUnits/PerformanceAdUnit';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';

export class PerformanceAdUnitParametersFactory extends AbstractAdUnitParametersFactory<PerformanceCampaign, IPerformanceAdUnitParameters> {

    protected createParameters(baseParams: IAdUnitParameters<PerformanceCampaign>) {
        const overlay = this.createOverlay(baseParams, baseParams.privacy);

        const adUnitStyle: AdUnitStyle = baseParams.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();

        const endScreenParameters: IEndScreenParameters = {
            ... this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams),
            adUnitStyle: adUnitStyle,
            campaignId: baseParams.campaign.getId(),
            osVersion: baseParams.deviceInfo.getOsVersion()
        };

        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);
        const endScreen = this.createEndscreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle
        };
    }

    private createEndscreen(endScreenParameters: IEndScreenParameters, campaign: PerformanceCampaign, country: string): PerformanceEndScreen | ExternalEndScreen {
        return campaign.getEndScreenType() === 'iframe'
            ? new ExternalEndScreen(undefined, endScreenParameters, campaign, country)
            : new PerformanceEndScreen(endScreenParameters, campaign, country);
    }

    protected createVideoOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean): VideoOverlay {
        return new VideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);
    }

    protected createOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy): AbstractVideoOverlay {
        let showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;

        // hide privacy icon for China
        if (parameters.adsConfig.getHidePrivacy()) {
           showPrivacyDuringVideo = false;
        }

        const showGDPRBanner = this.showGDPRBanner(parameters) && showPrivacyDuringVideo;
        const overlay = this.createVideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }
}
