import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen, SQUARE_END_SCREEN } from 'Performance/Views/PerformanceEndScreen';
import EndScreenAnimatedDownloadButton from 'html/mabexperimentation/EndScreenAnimatedDownloadButton.html';
import SquareEndScreenAnimatedDownloadButtonTemplate from 'html/mabexperimentation/SquareEndScreenAnimatedDownloadButton.html';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { ButtonExperimentDeclaration, ButtonAnimationsExperiment } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Color } from 'Core/Utilities/Color';
import { IColorTheme } from 'Performance/Utilities/Swatch';
import { ColorTheme } from 'Core/Utilities/ColorTheme';

export class AnimatedDownloadButtonEndScreen extends PerformanceEndScreen {
    private _animation: string;
    private _downloadButtonColor: string;
    private _darkMode: boolean;
    private _tintColor: boolean;

    constructor(combination: IExperimentActionChoice | undefined, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        combination = this.fixupExperimentChoices(combination);

        switch (combination.scheme) {
            case ButtonExperimentDeclaration.scheme.LIGHT:
                this._downloadButtonColor = Color.hexToCssRgba(combination.color);
                break;
            case ButtonExperimentDeclaration.scheme.DARK:
                // This is "pastel blue", to be cohesive with dark mode
                this._downloadButtonColor = Color.hexToCssRgba('#2ba3ff');
                this._darkMode = true;
                break;
            case ButtonExperimentDeclaration.scheme.COLORMATCHING:
                this._tintColor = true;
                break;
            default:
        }

        // combination.animation will be defined at this point
        this._animation = combination.animation!;
        this._templateData = {
            ...this._templateData,
            'hasShadow': this._animation === ButtonExperimentDeclaration.animation.BOUNCING
        };
    }

    private fixupExperimentChoices(actions: IExperimentActionChoice | undefined): IExperimentActionChoice {
        if (actions === undefined) {
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        // light scheme must include a color
        if (actions.scheme === ButtonExperimentDeclaration.scheme.LIGHT && actions.color === undefined) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        if (!ButtonAnimationsExperiment.isValid(actions)) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        return actions;
    }

    public render(): void {
        super.render();
        this._container.classList.add(`${this._animation}-download-button-end-screen`);
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            this._container.classList.add(`${this._animation}-download-button-end-screen-square`);
        }
        if (this._downloadButtonColor) {
            const ctaButton = <HTMLElement> this._container.querySelector('.download-container');
            if (ctaButton !== null) {
                ctaButton.style.backgroundColor = this._downloadButtonColor;
            }
        }
        if (this._tintColor) {
            ColorTheme.calculateColorThemeForEndCard(this._campaign, this._core)
                .then((theme) => {
                    this.applyColorTheme(theme.base, theme.secondary);
                })
                .catch((error) => {
                    SDKMetrics.reportMetricEvent(error.tag);
                });
        }
    }

    private applyDarkMode() {
        document.body.classList.add('dark-mode');
    }

    private applyColorTheme(baseColorTheme: IColorTheme, secondaryColorTheme: IColorTheme): void {
        if (!baseColorTheme.light || !baseColorTheme.medium || !baseColorTheme.dark ||
            !secondaryColorTheme.light || !secondaryColorTheme.medium || !secondaryColorTheme.dark) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintTheme);
            return;
        }

        const backgroundElement: HTMLElement | null = this._container.querySelector('.end-screen-info-background');
        const downloadContainer: HTMLElement | null = this._container.querySelector('.download-container');
        const gameNameContainer: HTMLElement | null = this._container.querySelector('.name-container');
        const gameRatingContainer: HTMLElement | null = this._container.querySelector('.game-rating-count');
        const privacyIconContainer: HTMLElement | null = this._container.querySelector('.bottom-container .icon-gdpr');
        const unityIconContainer: HTMLElement | null = this._container.querySelector('.bottom-container .unityads-logo');
        const chinaAdvertisementElement: HTMLElement | null = this._container.querySelector('.bottom-container .china-advertisement');

        if (backgroundElement && downloadContainer && gameNameContainer && gameRatingContainer && privacyIconContainer && unityIconContainer && chinaAdvertisementElement) {
            const secondary = Color.lerp(secondaryColorTheme.light, secondaryColorTheme.medium, 0.3);
            const baseDark = baseColorTheme.dark.toCssRgb();
            backgroundElement.style.background = `linear-gradient(${secondary.toCssRgb()},${baseColorTheme.light.toCssRgb()})`;
            downloadContainer.style.background = baseColorTheme.medium.toCssRgb();
            gameNameContainer.style.color = baseDark;
            gameRatingContainer.style.color = baseDark;
            privacyIconContainer.style.color = baseDark;
            unityIconContainer.style.color = baseDark;
            chinaAdvertisementElement.style.color = baseDark;
        } else {
            SDKMetrics.reportMetricEvent(AUIMetric.EndscreenColorTintThemingFailed);
        }
    }

    public show(): void {
        super.show();
        window.addEventListener('resize', this.handleResize, false);
        if (this._darkMode) {
            this.applyDarkMode();
        }
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('resize', this.handleResize);
        if (this._darkMode) {
            document.body.classList.remove('dark-mode');
        }
    }

    protected getTemplate() {
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return SquareEndScreenAnimatedDownloadButtonTemplate;
        }
        return EndScreenAnimatedDownloadButton;
    }

    private handleResize() {
        const element = <HTMLElement> document.getElementById('end-screen');
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
