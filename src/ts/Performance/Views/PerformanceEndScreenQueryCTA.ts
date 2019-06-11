import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Template } from 'Core/Utilities/Template';
import EndScreenQuery from 'html/EndScreenQuery.html';

export class PerformanceEndScreenQueryCTA extends PerformanceEndScreen {
    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        this._template = new Template(EndScreenQuery, this._localization);

        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const adjustedRating: number = campaign.getRating() * 20;
        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': portraitImage ? portraitImage.getUrl() : undefined,
            'endScreenPortrait': landscapeImage ? landscapeImage.getUrl() : undefined,
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt()
        };

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
