import { Campaign } from 'Models/Campaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';

export class CampaignAssetStatus {
    public static isCached(campaign: Campaign): boolean {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if((landscapeVideo && landscapeVideo.isCached()) || (portraitVideo && portraitVideo.isCached())) {
                return true;
            }
        } else if(campaign instanceof VastCampaign) {
            return campaign.getVideo().isCached();
        } else if (campaign instanceof MRAIDCampaign) {
            const resouceUrl = campaign.getResourceUrl();
            if((resouceUrl && resouceUrl.isCached()) || campaign.getResource()) {
                return true;
            }
        }

        return false;
    }

    public static getCachedOrientation(campaign: Campaign): string | undefined {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if((landscapeVideo && landscapeVideo.isCached())) {
                return 'landscape';
            } else if((portraitVideo && portraitVideo.isCached())) {
                return 'portrait';
            }
        }

        return undefined;
    }
}
