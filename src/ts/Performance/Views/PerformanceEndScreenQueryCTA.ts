import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Template } from 'Core/Utilities/Template';
import EndScreenQuery from 'html/EndScreenQuery.html';

export class PerformanceEndScreenQueryCTA extends PerformanceEndScreen {
    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        this._template = new Template(EndScreenQuery, this._localization);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .download-yes, .game-icon, .game-image'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.download-no'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button, .gdpr-link, .icon-gdpr'
            }
        ];
    }

    public render(): void {
        super.render();

        (<HTMLElement>this._container.querySelector('.download-container')).style.background = 'rgba(255, 255, 255, 0)';
    }
}
