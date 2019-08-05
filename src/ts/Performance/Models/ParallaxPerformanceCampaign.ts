import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Asset } from 'Ads/Models/Assets/Asset';

export class ParallaxPerformanceCampaign extends PerformanceCampaign {
    public getOptionalAssets() {
        const assets: Asset[] = super.getOptionalAssets();
        assets.push(...this.getScreenshots());

        return assets;
    }

    public getScreenshots() {
        return this.get('screenshots') || [];
    }

    public getScreenshotLayout() {
      return this.get('screenshotLayout') || [];
    }
}
