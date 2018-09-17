import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';

export class ProgrammaticAdMobLoader extends CampaignLoader {
    public load(data: string): AdMobCampaign | undefined {
        let campaign;
        try {
            campaign = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        if(campaign.session) {
            campaign.session = this.loadSession(campaign.session);
        }

        if(campaign.video) {
            campaign.video = this.loadVideo(campaign.video, campaign.session);
        }

        let adMobCampaign;
        try {
            adMobCampaign = new AdMobCampaign(campaign);
        } catch(e) {
            return undefined;
        }

        return adMobCampaign;
    }
}
