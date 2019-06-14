import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { ICoreApi } from 'Core/ICore';
import { Template } from 'Core/Utilities/Template';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import SquareEndScreenTemplate from 'html/SquareEndScreen.html';
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
