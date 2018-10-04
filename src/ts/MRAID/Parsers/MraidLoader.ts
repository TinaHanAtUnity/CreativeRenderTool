import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';

export class MraidLoader extends CampaignLoader {
    public load(data: string): MRAIDCampaign | undefined {
        let campaign;
        try {
            campaign = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        if(campaign.session) {
            campaign.session = this.loadSession(campaign.session);
        }

        if(campaign.gameIcon) {
            campaign.gameIcon = this.loadImage(campaign.gameIcon, campaign.session);
        }

        if(campaign.landscapeImage) {
            campaign.landscapeImage = this.loadImage(campaign.landscapeImage, campaign.session);
        }

        if(campaign.portraitImage) {
            campaign.portraitImage = this.loadImage(campaign.portraitImage, campaign.session);
        }

        if(campaign.resourceAsset) {
            campaign.resourceAsset = this.loadHTML(campaign.resourceAsset, campaign.session);
        }

        if(campaign.playableConfiguration) {
            // todo: is playableConfiguration completely optional? is this ok? if not, how to handle playableConfiguration here?
            delete campaign.playableConfiguration;
        }

        let mraidCampaign;
        try {
            mraidCampaign = new MRAIDCampaign(campaign);
        } catch(e) {
            return undefined;
        }

        return mraidCampaign;
    }
}
