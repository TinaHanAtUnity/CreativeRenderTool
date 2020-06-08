import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import EndScreenColorBlur from 'html/mabexperimentation/EndScreenColorBlur.html';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { IColorTheme } from 'Performance/Utilities/Swatch';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { ButtonAnimationsExperiment, ButtonExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';

export class ColorBlurEndScreen extends PerformanceEndScreen {
    private _ctaText: string;
    private _language: string;

    constructor(combination: IExperimentActionChoice | undefined, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        const simpleRating = campaign.getRating().toFixed(1);

        combination = this.fixupExperimentChoices(combination);

        if (combination.ctaText) {
            this._ctaText = combination.ctaText;
        }

        this._language = parameters.language;
        this._templateData = {
            ...this._templateData,
            simpleRating: simpleRating,
            ctaText: this._ctaText,
            isEnglish: this._language.indexOf('en') !== -1
        };
        this._bindings.splice(0, 1, {
            event: 'click',
            listener: (event: Event) => this.onDownloadEvent(event),
            selector: '.end-screen-image, .install-container, .game-info-container'
        });
    }

    private fixupExperimentChoices(actions: IExperimentActionChoice | undefined): IExperimentActionChoice {
        if (actions === undefined) {
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        if (actions.ctaText === undefined) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidCtaText);
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        return actions;
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

        if (this._ctaText === ButtonExperimentDeclaration.ctaText.DOWNLOAD_FOR_FREE) {
            const installContainer: HTMLElement | null = this._container.querySelector('.install-container');
            if (installContainer) {
                installContainer.classList.add('cta-alt-text');
            }
        }
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
