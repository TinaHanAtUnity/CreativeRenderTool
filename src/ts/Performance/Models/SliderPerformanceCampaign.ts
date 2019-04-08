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
}
