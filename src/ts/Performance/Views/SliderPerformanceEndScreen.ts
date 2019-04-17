import { EndScreen, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';
import { Slider } from 'Performance/Views/Slider';
import SliderEndScreenTemplate from 'html/SliderEndScreen.html';
import { detectOrientation } from 'Device';
import { Template } from 'Core/Utilities/Template';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

interface ISliderEventParameters {
    manualSlideCount: number;
    automaticSlideCount: number;
    downloadClicked: boolean;
    sliderReadyWhenShown: boolean | undefined;
}

export class SliderPerformanceEndScreen extends EndScreen {
    private _campaign: SliderPerformanceCampaign;
    private _slider: Slider;
    private _sliderEventParameters: ISliderEventParameters;
    private _showTimestamp: number;
    private _sliderEventSent: boolean;

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

        this._sliderEventParameters = {
            automaticSlideCount: 0,
            manualSlideCount: 0,
            downloadClicked: false,
            sliderReadyWhenShown: undefined
        };

        this._sliderEventSent = false;

        this._slider = new Slider(screenshots, campaign.getScreenshotsOrientation(), this.onSlideCallback);
    }

    public show(): void {
        super.show();
        const sliderWasReady = this._slider.show();

        if (this._showTimestamp === undefined) {
            this._showTimestamp = Date.now();
            this._sliderEventParameters.sliderReadyWhenShown = sliderWasReady;
        }
    }

    private onSlideCallback = ({ automatic }: { automatic: boolean }): void => {
        if (automatic) {
            this._sliderEventParameters.automaticSlideCount += 1;
            return;
        }

        this._sliderEventParameters.manualSlideCount += 1;
    }

    private sendSlideEventToKafka() {
        if (this._sliderEventSent) {
            return;
        }
        this._sliderEventSent = true;

        const kafkaObject: { [key: string]: unknown } = this._sliderEventParameters;
        kafkaObject.type = 'slider_data';
        kafkaObject.auctionId = this._campaign.getSession().getId();
        kafkaObject.timeVisible = Date.now() - this._showTimestamp;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    public hide(): void {
        super.hide();
        this._slider.hide();

        // Hide seems to be called first time when the ad is shown before 'show' call so guard
        // against not sending event when that happens.
        if (this._showTimestamp) {
            this.sendSlideEventToKafka();
        }
    }

    public render(): void {
        super.render();
        this._slider.attachTo(<HTMLElement>this.container().querySelector('.game-background-container'));
    }

    protected onDownloadEvent(event: Event): void {
        event.preventDefault();
        this._sliderEventParameters.downloadClicked = true;
        this.sendSlideEventToKafka();
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
}
