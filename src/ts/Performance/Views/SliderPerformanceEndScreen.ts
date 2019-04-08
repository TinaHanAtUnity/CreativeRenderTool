import { EndScreen, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';
import { Slider } from 'Performance/Views/Slider';
import SliderEndScreenTemplate from 'html/SliderEndScreen.html';
import { detectOrientation } from 'Device';
import { Template } from 'Core/Utilities/Template';

export class SliderPerformanceEndScreen extends EndScreen {
    private _campaign: SliderPerformanceCampaign;
    private _slider: Slider;

    constructor(parameters: IEndScreenParameters, campaign: SliderPerformanceCampaign) {
        super(parameters);
        this._campaign = campaign;

        this._template = new Template(this.getTemplate(), this._localization);

        const adjustedRating: number = campaign.getRating() * 20;

        const screenshots = campaign.getScreenshots().map(s => s.getUrl());

        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();

        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': portraitImage ? portraitImage.getUrl() : undefined,
            'endScreenPortrait': landscapeImage ? landscapeImage.getUrl() : undefined,
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt(),
            'screenshots': screenshots
        };

        this._slider = new Slider(screenshots);
    }

    public render(): void {
        super.render();
        this._slider.attachTo(<HTMLElement>this.container().querySelector('.game-background-container'));
    }

    // public show(): void {
    //     super.show();
    //     this.resize();
    //     this._slider.show();
    //     window.addEventListener('resize', this.resize.bind(this), false);
    // }

    protected onDownloadEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            adUnitStyle: this._adUnitStyle
        }));
    }

    protected getTemplate() {
        return SliderEndScreenTemplate;
    }

    // protected resize() {
    //     const orientation = detectOrientation();
    //     if (orientation === 'portrait') {
    //         this._slider.resize(window.innerWidth, window.innerHeight / 2, true);
    //     } else {
    //         this._slider.resize(window.innerWidth / 2, window.innerHeight, true);
    //     }
    // }
}
