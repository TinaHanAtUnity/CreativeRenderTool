import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IXPromoAdUnitParameters } from 'XPromo/AdUnits/XPromoAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { AnimationEndCardTest } from 'Core/Models/ABGroup';
import { AnimatedVideoOverlay } from 'Ads/Views/AnimatedVideoOverlay';

export class XPromoAdUnitParametersFactory extends AbstractAdUnitParametersFactory<XPromoCampaign, IXPromoAdUnitParameters> {
    protected createParameters(baseParams: IAdUnitParameters<XPromoCampaign>) {
        const overlay = this.createOverlay(baseParams, baseParams.privacy);

        const endScreenParameters = this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams);
        const endScreen = new XPromoEndScreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen
        };
    }

    private createOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy): AbstractVideoOverlay {
        const showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;
        const showGDPRBanner = this.showGDPRBanner(parameters) && showPrivacyDuringVideo;

        let overlay: VideoOverlay;
        const abGroup = parameters.coreConfig.getAbGroup();
        if (AnimationEndCardTest.isValid(abGroup)) {
            overlay = new AnimatedVideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);
        } else {
            overlay = new VideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);
        }

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }
}
