import { EndScreen, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';
import { Slider } from 'Performance/Views/Slider';
import SliderEndScreenTemplate from 'html/SliderEndScreen.html';
import { detectOrientation } from 'Device';

export class SliderPerformanceEndScreen extends EndScreen {
    private _campaign: SliderPerformanceCampaign;
    private _slider: Slider;

    constructor(parameters: IEndScreenParameters, campaign: SliderPerformanceCampaign) {
        super(parameters);

        const adjustedRating: number = campaign.getRating() * 20;

        const screenshots = campaign.getScreenshots().map(s => s.getUrl());

        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': campaign.getPortrait().getUrl(),
            'endScreenPortrait': campaign.getLandscape().getUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt(campaign),
            'screenshots': screenshots
        };

        this._campaign = campaign;

        this._slider = new Slider(screenshots);
    }

    public render(): void {
        super.render();
        this._slider.attachTo(<HTMLElement>this.container().querySelector('.game-background-container'));
    }

    public show(): void {
        super.show();
        this.resize();
        window.addEventListener('resize', this.resize.bind(this), false);
    }

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

    protected resize() {
        const orientation = detectOrientation();
        if (orientation === 'portrait') {
            this._slider.resize(window.innerWidth, window.innerHeight / 2, true);
        } else {
            this._slider.resize(window.innerWidth / 2, window.innerHeight, true);
        }
    }
}
