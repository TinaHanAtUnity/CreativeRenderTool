import { IPerformanceCampaign, PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export class SliderPerformanceCampaign extends PerformanceCampaign {
    constructor(campaign: IPerformanceCampaign) {
        super(campaign);
    }

    public getOptionalAssets() {
        const assets = super.getOptionalAssets();
        assets.push(...this.getScreenshots());
        return assets;
    }

    public getScreenshots() {
        return this.get('screenshots') || [];
    }

    public getScreenshotsOrientation(): 'portrait' | 'landscape' {
        // Note: In practice we don't need the default value but because the screenshotsOrientation is in
        // IPerformanceCampaign interface it needs to be optional
        return this.get('screenshotsOrientation') || 'portrait';
    }
}
