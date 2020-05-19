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
        this._bindings.push({
            event: 'click',
            listener: (event: Event) => this.onDownloadEvent(event),
            selector: '.end-screen-image, .install-container'
        });
    }

    public render(): void {
        super.render();
        const colorTheme = ColorTheme.renderColorTheme(this._campaign, this._core);

        colorTheme
            .then((theme) => {
                if (theme) {
                    this.applyColorTheme(theme.baseColorTheme, theme.secondaryColorTheme);
                }
            })
            .catch(() => {
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintSwitches);
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
        document.body.classList.add('color-blur');
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('resize', this.handleResize);
        document.body.classList.remove('color-blur');
    }

    protected getTemplate() {
        return EndScreenColorBlur;
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
