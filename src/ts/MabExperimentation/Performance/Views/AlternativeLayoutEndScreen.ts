import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import EndScreenAlternativeLayout from 'html/mabexperimentation/EndScreenAlternativeLayout.html';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Color } from 'Core/Utilities/Color';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { IColorTheme } from 'Performance/Utilities/Swatch';

export class AlternativeLayoutEndScreen extends PerformanceEndScreen {
    private _alternativeLayout: boolean;

    constructor(
        // combination: IExperimentActionChoice | undefined,
        parameters: IEndScreenParameters,
        campaign: PerformanceCampaign,
        country?: string
    ) {
        super(parameters, campaign, country);

        // combination = this.fixupExperimentChoices(combination);
        const simpleRating = campaign.getRating().toFixed(1);
        this._templateData = {
            ...this._templateData,
            simpleRating: simpleRating
        };
        this._alternativeLayout = true;
        this._bindings.push({
            event: 'click',
            listener: (event: Event) => this.onDownloadEvent(event),
            selector: '.end-screen-image, .install-container'
        });
    }

    public render(): void {
        super.render();
        this.renderColorTheme();
    }

    private applyAlternativeLayout() {
        document.body.classList.add('alternative-layout');
    }

    private renderColorTheme() {
        const portraitImage = this._campaign.getPortrait();
        const landscapeImage = this._campaign.getLandscape();
        const squareImage = this._campaign.getSquare();

        const deviceInfo = this._core.DeviceInfo;
        Promise.all([deviceInfo.getScreenWidth(), deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
            const isLandscape = screenWidth > screenHeight;
            let image;
            if (squareImage) {
                image = squareImage;
            } else if (isLandscape && portraitImage) {
                image = portraitImage; // when the device is in landscape mode, we are showing a portrait image
            } else if (landscapeImage) {
                image = landscapeImage;
            } else {
                image = portraitImage;
            }

            if (image) {
                ImageAnalysis.getImageSrc(this._core.Cache, image)
                    .then(ImageAnalysis.analyseImage)
                    .then((swatches) => {
                        if (!swatches || !swatches.length) {
                            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintSwitches);
                            return;
                        }

                        const baseColorTheme = swatches[0].getColorTheme();
                        const secondaryColorTheme = (swatches.length > 1 ? swatches[1] : swatches[0]).getColorTheme();
                        this.applyColorTheme(baseColorTheme, secondaryColorTheme);
                    })
                    .catch((msg: string) => {
                        SDKMetrics.reportMetricEventWithTags(AUIMetric.EndscreenColorTintError, {
                            msg: msg
                        });
                    });
            }
        });
    }

    private applyColorTheme(baseColorTheme: IColorTheme, secondaryColorTheme: IColorTheme): void {
        if (
            !baseColorTheme.light ||
            !baseColorTheme.medium ||
            !baseColorTheme.dark ||
            !secondaryColorTheme.light ||
            !secondaryColorTheme.medium ||
            !secondaryColorTheme.dark
        ) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintTheme);
            return;
        }

        const gameInfoContainer: HTMLElement | null = this._container.querySelector('.game-info-container');
        const installContainer: HTMLElement | null = this._container.querySelector('.install-container');

        if (gameInfoContainer && installContainer) {
            gameInfoContainer.style.background = baseColorTheme.medium.toCssRgb();
            installContainer.style.color = baseColorTheme.medium.toCssRgb();
        } else {
            SDKMetrics.reportMetricEvent(AUIMetric.EndscreenColorTintThemingFailed);
        }
    }

    public show(): void {
        super.show();
        window.addEventListener('resize', this.handleResize, false);
        if (this._alternativeLayout) {
            this.applyAlternativeLayout();
        }
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('resize', this.handleResize);
        if (this._alternativeLayout) {
            document.body.classList.remove('alternative-layout');
        }
    }

    protected getTemplate() {
        return EndScreenAlternativeLayout;
    }

    private handleResize() {
        const element = <HTMLElement>document.getElementById('end-screen');
        if (element == null) {
            return;
        }

        // By triggering a reflow, the button's animation is restarted when
        // the end-screen is resized (in the case of an orientation change,
        // for example).
        element.classList.remove('on-show');
        setTimeout(() => element.classList.add('on-show'), 0);
    }
}
