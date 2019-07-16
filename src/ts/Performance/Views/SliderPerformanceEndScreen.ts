import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { SliderPerformanceCampaign, SliderEndScreenImageOrientation } from 'Performance/Models/SliderPerformanceCampaign';
import { Slider } from 'Performance/Views/Slider';
import SliderEndScreenTemplate from 'html/SliderEndScreen.html';
import { Template } from 'Core/Utilities/Template';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ICoreApi } from 'Core/ICore';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

interface ISliderEventParameters {
    manualSlideCount: number;
    automaticSlideCount: number;
    downloadClicked: boolean;
    sliderReadyWhenShown: boolean | undefined;
    [key: string]: boolean | undefined | number | string;
}

export class SliderPerformanceEndScreen extends PerformanceEndScreen {
    protected _country: string | undefined;
    protected _core: ICoreApi;
    protected _campaign: SliderPerformanceCampaign;
    private _slider: Slider;
    private _sliderEventParameters: ISliderEventParameters;
    private _showTimestamp: number;
    private _sliderUsageDataEventSent: boolean;

    constructor(parameters: IEndScreenParameters, campaign: SliderPerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        const screenshots = campaign.getScreenshots().map(s => s.getUrl());
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        const squareImageUrl = squareImage ? squareImage.getUrl() : undefined;
        const portraitImageUrl = portraitImage ? portraitImage.getUrl() : undefined;
        const landscapeImageUrl = landscapeImage ? landscapeImage.getUrl() : undefined;
        const screenshotOrientation = campaign.getScreenshotsOrientation();

        this._sliderEventParameters = {
            automaticSlideCount: 0,
            manualSlideCount: 0,
            downloadClicked: false,
            sliderReadyWhenShown: undefined,
            squareImageAsMainImage: !!squareImage,
            screenshotOrientation: screenshotOrientation === SliderEndScreenImageOrientation.PORTRAIT ? 'portrait' : 'landscape'
        };

        this._sliderUsageDataEventSent = false;

        const mainImageUrl = this.getMainImageUrl(screenshotOrientation, squareImageUrl, portraitImageUrl, landscapeImageUrl);
        if (mainImageUrl) {
            screenshots.unshift(mainImageUrl);
        }

        this._slider = new Slider(screenshots, screenshotOrientation, this.onSlideCallback, this.onDownloadCallback);
    }

    private getMainImageUrl(imageOrientation: SliderEndScreenImageOrientation, squareImageUrl?: string, portraitImageUrl?: string, landscapeImageUrl?: string): string | undefined {
        if (squareImageUrl !== undefined) {
            return squareImageUrl;
        } else if (imageOrientation === SliderEndScreenImageOrientation.PORTRAIT && portraitImageUrl) {
            return portraitImageUrl;
        } else if (imageOrientation === SliderEndScreenImageOrientation.LANDSCAPE && landscapeImageUrl) {
            return landscapeImageUrl;
        }
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

        const kafkaObject = this._sliderEventParameters;
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
        this._slider.attachTo(<HTMLElement> this.container().querySelector('.game-background-container'));
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
