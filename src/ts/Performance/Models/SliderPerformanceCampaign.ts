import { IPerformanceCampaign, PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export class SliderPerformanceCampaign extends PerformanceCampaign {
    constructor(campaign: IPerformanceCampaign) {
        super(campaign);
    }

    public getRequiredAssets() {
        return this.getScreenshots();
    }

    public getScreenshots() {
        return this.get('screenshots') || [];
    }
}
