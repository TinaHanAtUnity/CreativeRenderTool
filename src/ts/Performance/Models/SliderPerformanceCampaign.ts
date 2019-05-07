import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Asset } from 'Ads/Models/Assets/Asset';

export enum SliderEndScreenImageOrientation {
    LANDSCAPE,
    PORTRAIT
}

export class SliderPerformanceCampaign extends PerformanceCampaign {

    public getOptionalAssets() {
        const assets: Asset[] = [];
        assets.push(this.getGameIcon());
        assets.push(...this.getScreenshots());

        return assets;
    }

    public getScreenshots() {
        return this.get('screenshots') || [];
    }

    public getScreenshotsOrientation(): SliderEndScreenImageOrientation {
        const orientation = this.get('screenshotsOrientation');
        // Note: In practice we don't need the default value but because the screenshotsOrientation is in
        // IPerformanceCampaign interface it needs to be optional
        if (orientation === undefined) {
            return SliderEndScreenImageOrientation.PORTRAIT;
        }

        return orientation;
    }
}
