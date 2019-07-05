import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export class PerformanceEndScreenDoubleShadowClose extends PerformanceEndScreen {

    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);
    }

    public render(): void {
        super.render();

        const iconClose = this.container().querySelector('#end-screen .icon-close');
        if (iconClose) {
            iconClose.classList.add('icon-close-double-shadow');
        }
    }
}
