import { EndScreen, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';
import { Slider } from 'Performance/Views/Slider';
import SliderEndScreenTemplate from 'html/SliderEndScreen.html';
import { Template } from 'Core/Utilities/Template';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ICoreApi } from 'Core/ICore';

interface ISliderEventParameters {
    manualSlideCount: number;
    automaticSlideCount: number;
    downloadClicked: boolean;
    sliderReadyWhenShown: boolean | undefined;
}

export class SliderPerformanceEndScreen extends EndScreen {
    private _core: ICoreApi;
    private _country: string | undefined;
    private _campaign: SliderPerformanceCampaign;
    private _slider: Slider;
    private _sliderEventParameters: ISliderEventParameters;
    private _showTimestamp: number;
    private _sliderUsageDataEventSent: boolean;
    private _country: string | undefined;

    constructor(parameters: IEndScreenParameters, campaign: SliderPerformanceCampaign, country?: string) {
        super(parameters);
        this._campaign = campaign;
        this._country = country;

        this._template = new Template(this.getTemplate(), this._localization);

        const adjustedRating: number = campaign.getRating() * 20;

        const screenshots = campaign.getScreenshots().map(s => s.getUrl());
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();

        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt(),
            'screenshots': screenshots,
            'endScreenLandscape': portraitImage ? portraitImage.getUrl() : undefined,
            'endScreenPortrait': landscapeImage ? landscapeImage.getUrl() : undefined,
            'endScreenSquare': squareImage ? squareImage.getUrl() : undefined
        };

        this._sliderEventParameters = {
            automaticSlideCount: 0,
            manualSlideCount: 0,
            downloadClicked: false,
            sliderReadyWhenShown: undefined
        };

        this._sliderUsageDataEventSent = false;

        this._slider = new Slider(screenshots, campaign.getScreenshotsOrientation(), this.onSlideCallback, this.onDownloadCallback, portraitImage ? portraitImage.getUrl() : undefined, landscapeImage ? landscapeImage.getUrl() : undefined, squareImage ? squareImage.getUrl() : undefined);
    }

    public show(): void {
        super.show();
        const sliderWasReady = this._slider.show();

        if (this._showTimestamp === undefined) {
            this._showTimestamp = Date.now();
            this._sliderEventParameters.sliderReadyWhenShown = sliderWasReady;
        }
    }

    private onDownloadCallback = (event: Event) => this.onDownloadEvent(event);

    private onSlideCallback = ({ automatic }: { automatic: boolean }): void => {
        if (automatic) {
            this._sliderEventParameters.automaticSlideCount += 1;
            return;
        }

        this._sliderEventParameters.manualSlideCount += 1;
    }

    private sendSliderUsageDataEventToKafka() {
        if (this._sliderUsageDataEventSent) {
            return;
        }
        this._sliderUsageDataEventSent = true;

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
            this.sendSliderUsageDataEventToKafka();
        }
    }

    public render(): void {
        super.render();
        this._slider.attachTo(<HTMLElement>this.container().querySelector('.game-background-container'));
    }

    protected onDownloadEvent(event: Event): void {
        event.preventDefault();
        this._sliderEventParameters.downloadClicked = true;
        this.sendSliderUsageDataEventToKafka();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            appDownloadUrl: this._campaign.getAppDownloadUrl(),
            adUnitStyle: this._adUnitStyle
        }));
    }

    protected getTemplate() {
        return SliderEndScreenTemplate;
    }
}
