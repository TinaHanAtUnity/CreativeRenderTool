import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import EndScreenColorBlur from 'html/mabexperimentation/EndScreenColorBlur.html';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { IColorTheme } from 'Performance/Utilities/Swatch';

export class ColorBlurEndScreen extends PerformanceEndScreen {
    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        const simpleRating = campaign.getRating().toFixed(1);
        this._templateData = {
            ...this._templateData,
            simpleRating: simpleRating
        };
        this._bindings.splice(0, 1, {
            event: 'click',
            listener: (event: Event) => this.onDownloadEvent(event),
            selector: '.end-screen-image, .install-container, .game-info-container'
        });
    }

    public render(): void {
        super.render();

        ColorTheme.calculateColorThemeForEndCard(this._campaign, this._core)
            .then((theme) => {
                this.applyColorTheme(theme.base);
            })
            .catch((error) => {
                SDKMetrics.reportMetricEvent(error.tag);
            });
    }

    private applyColorTheme(baseColorTheme: IColorTheme): void {
        if (!baseColorTheme.light || !baseColorTheme.medium || !baseColorTheme.dark) {
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
        document.body.classList.add('color-blur');
    }

    public hide(): void {
        super.hide();
        document.body.classList.remove('color-blur');
    }

    protected getTemplate() {
        return EndScreenColorBlur;
    }
}
