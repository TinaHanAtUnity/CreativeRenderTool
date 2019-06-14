import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';

export class AnimatedPerfomanceEndScreen extends PerformanceEndScreen {
    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);
    }

    protected onCloseEvent(event: Event): void {
        if (this._container.classList.contains('on-show')) {
            super.onCloseEvent(event);
        } else {
            event.preventDefault();
            return;
        }
    }

    protected onDownloadEvent(event: Event): void {
        if (this._container.classList.contains('on-show')) {
            super.onDownloadEvent(event);
        } else {
            event.preventDefault();
            return;
        }
    }
}
