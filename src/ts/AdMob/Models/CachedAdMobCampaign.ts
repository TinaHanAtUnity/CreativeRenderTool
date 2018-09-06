import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Asset } from 'Ads/Models/Assets/Asset';

export class CachedAdMobCampaign extends AdMobCampaign {
    public getRequiredAssets(): Asset[] {
        const assets = [];
        const video = this.get('video');
        if (video) {
            assets.push(video.getVideo());
        }
        return assets;
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }
}
