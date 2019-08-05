
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { ICoreApi } from 'Core/ICore';

import { ParallaxScreen } from 'Performance/Utilities/ParallaxScreen';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { ParallaxPerformanceCampaign } from 'Performance/Models/ParallaxPerformanceCampaign';
import ParallaxEndScreenTemplate from 'html/ParallaxEndScreen.html';

interface IParallaxEventParameters {
    downloadClicked: boolean;
    parallaxReadyWhenShown: boolean | undefined;
    [key: string]: boolean | undefined | number | string;
}

export class PerformanceParallaxEndScreen extends PerformanceEndScreen {
    private _parallaxScreen: ParallaxScreen;
    private _parallaxEventParameters: IParallaxEventParameters;
    private _showTimestamp: number;
    private _parallaxUsageDataEventSent: boolean;

    constructor(parameters: IEndScreenParameters, campaign: ParallaxPerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        this._parallaxEventParameters = {
            downloadClicked: false,
            parallaxReadyWhenShown: undefined
        };

        this._parallaxUsageDataEventSent = false;

        const screenshots = campaign.getScreenshots().map(s => s.getUrl());
        const screenshotLayout = campaign.getScreenshotLayout();
        this._parallaxScreen = new ParallaxScreen(screenshots, screenshotLayout);
    }

    public show(): void {
        super.show();
        const parallaxWasReady = this._parallaxScreen.show();

        if (this._showTimestamp === undefined) {
            this._showTimestamp = Date.now();
            this._parallaxEventParameters.parallaxReadyWhenShown = parallaxWasReady;
        }
    }

    private onDownloadCallback = (event: Event) => this.onDownloadEvent(event);

    public hide(): void {
        super.hide();
        this._parallaxScreen.hide();

        // Hide seems to be called first time when the ad is shown before 'show' call so guard
        // against not sending event when that happens.
        if (this._showTimestamp) {
            this.sendParallaxUsageDataEventToKafka();
        }
    }

    public render(): void {
        super.render();
        const backgroundContainer = <HTMLElement> this.container().querySelector('.parallax-root-container');
        this._parallaxScreen.attachTo(backgroundContainer);
    }

    protected getTemplate() {
        return ParallaxEndScreenTemplate;
    }

    private sendParallaxUsageDataEventToKafka() {
        if (this._parallaxUsageDataEventSent) {
            return;
        }
        this._parallaxUsageDataEventSent = true;

        const kafkaObject = this._parallaxEventParameters;
        kafkaObject.type = 'parallax_data';
        kafkaObject.auctionId = this._campaign.getSession().getId();
        kafkaObject.timeVisible = Date.now() - this._showTimestamp;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
