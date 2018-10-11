import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';
import { AdMobCampaign, AdMobVideo } from 'AdMob/Models/AdMobCampaign';

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
            let rawAdMobVideo;
            try {
                rawAdMobVideo = JSON.parse(campaign.video);
            } catch(e) {
                return undefined;
            }

            if(rawAdMobVideo.video) {
                rawAdMobVideo.video = this.loadVideo(rawAdMobVideo.video, campaign.session);
            }

            campaign.video = new AdMobVideo(rawAdMobVideo);
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
