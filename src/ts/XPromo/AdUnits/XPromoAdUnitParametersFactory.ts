import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IXPromoAdUnitParameters } from 'XPromo/AdUnits/XPromoAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';

export class XPromoAdUnitParametersFactory extends AbstractAdUnitParametersFactory<XPromoCampaign, IXPromoAdUnitParameters> {
    protected createParameters(baseParams: IAdUnitParameters<XPromoCampaign>) {
        const privacy = this.createPrivacy(baseParams);
        const showPrivacyDuringVideo = baseParams.placement.skipEndCardOnClose() || false;
        const overlay = this.createOverlay(baseParams, privacy, showPrivacyDuringVideo);

        const endScreenParameters = this.createEndScreenParameters(privacy, baseParams.campaign.getGameName(), baseParams);
        const endScreen = new XPromoEndScreen(endScreenParameters, baseParams.campaign);
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            privacy: privacy
        };
    }
}
