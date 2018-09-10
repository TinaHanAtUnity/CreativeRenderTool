import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export class CometCampaignLoader extends CampaignLoader {
    public load(data: string): PerformanceCampaign | undefined {
        let campaign;
        try {
            campaign = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        if(campaign.session) {
            campaign.session = this.loadSession(campaign.session);
        }

        if(campaign.adUnitStyle) {
            campaign.adUnitStyle = this.loadAdUnitStyle(campaign.adUnitStyle);
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

        if(campaign.video) {
            campaign.video = this.loadVideo(campaign.video, campaign.session);
        }

        if(campaign.streamingVideo) {
            campaign.streamingVideo = this.loadVideo(campaign.streamingVideo, campaign.session);
        }

        if(campaign.videoPortrait) {
            campaign.videoPortrait = this.loadVideo(campaign.videoPortrait, campaign.session);
        }

        if(campaign.streamingPortraitVideo) {
            campaign.streamingPortraitVideo = this.loadVideo(campaign.streamingPortraitVideo, campaign.session);
        }

        let performanceCampaign;
        try {
            performanceCampaign = new PerformanceCampaign(campaign);
        } catch(e) {
            return undefined;
        }

        return performanceCampaign;
    }
}
