import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen, SQUARE_END_SCREEN } from 'Performance/Views/PerformanceEndScreen';
import ExperimentEndScreenTemplate from 'html/mabexperimentation/ExperimentEndScreenTemplate.html';
import ExperimentSquareEndScreenTemplate from 'html/mabexperimentation/ExperimentSquareEndScreenTemplate.html';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { EndScreenExperimentDeclaration, EndScreenExperiment } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Color } from 'Core/Utilities/Color';
import { IColorTheme } from 'Performance/Utilities/Swatch';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { ColorUtils } from 'MabExperimentation/Utilities/ColorUtils';

export interface IClickHeatMapEntry {
    x: number;
    y: number;
    target: string;
    normalizedX: number;
    normalizedY: number;
    orientation: string;
    width: number;
    height: number;
}

export class ExperimentEndScreen extends PerformanceEndScreen {
    private _animation: string;
    private _downloadButtonColor: string;
    private _darkMode: boolean;
    private _tintColor: boolean;
    private _formattedCtaAlternativeText: string;
    private _language: string;
    private _clickHeatMapData: IClickHeatMapEntry[];

    constructor(combination: IExperimentActionChoice | undefined, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        combination = this.fixupExperimentChoices(combination);

        this.fixupScheme(combination);
        this.fixupCtaText(combination.cta_text);
        this._clickHeatMapData = [];

        // combination.animation will be defined at this point
        this._animation = combination.animation!;
        this._language = parameters.language;
        this._templateData = {
            ...this._templateData,
            hasShadow: this._animation === EndScreenExperimentDeclaration.animation.BOUNCING,
            ctaAlternativeText: this._formattedCtaAlternativeText,
            isEnglish: this._language.indexOf('en') !== -1
        };

        this._bindings.push({
            event: 'click',
            listener: (event: Event) => this.onClickCollection(event)
        });
    }

    private fixupScheme(actions: IExperimentActionChoice | undefined) {
        if (actions) {
            switch (actions.scheme) {
                case EndScreenExperimentDeclaration.scheme.LIGHT:
                    if (actions.color) {
                        this._downloadButtonColor = Color.hexToCssRgba(actions.color);
                    } else {
                        this._downloadButtonColor = Color.hexToCssRgba(EndScreenExperimentDeclaration.color.GREEN);
                    }
                    break;
                case EndScreenExperimentDeclaration.scheme.DARK:
                    if (actions.color) {
                        this._downloadButtonColor = Color.hexToCssRgba(actions.color);
                    } else {
                        this._downloadButtonColor = Color.hexToCssRgba(EndScreenExperimentDeclaration.color.DARK_BLUE);
                    }
                    this._darkMode = true;
                    break;
                case EndScreenExperimentDeclaration.scheme.COLORMATCHING:
                    this._tintColor = true;
                    break;
                default:
            }
        }
    }

    private fixupCtaText(ctaText: string | undefined) {
        switch (ctaText) {
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD:
                this._formattedCtaAlternativeText = 'Download';
                break;
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE:
                this._formattedCtaAlternativeText = 'Download For Free';
                break;
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW:
                this._formattedCtaAlternativeText = 'Download Now!';
                break;
            case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE:
                this._formattedCtaAlternativeText = '🔥 Download Now 🔥';
                break;
            case EndScreenExperimentDeclaration.cta_text.GET:
                this._formattedCtaAlternativeText = 'Get';
                break;
            case EndScreenExperimentDeclaration.cta_text.GET_STARTED:
                this._formattedCtaAlternativeText = 'Get Started!';
                break;
            case EndScreenExperimentDeclaration.cta_text.INSTALL_NOW:
                this._formattedCtaAlternativeText = 'Install Now';
                break;
            case EndScreenExperimentDeclaration.cta_text.LETS_TRY_IT:
                this._formattedCtaAlternativeText = `Let's try it!`;
                break;
            case EndScreenExperimentDeclaration.cta_text.OK:
                this._formattedCtaAlternativeText = 'OK!';
                break;
            default:
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidCtaText);
                this._formattedCtaAlternativeText = 'Download For Free';
        }
    }

    private fixupExperimentChoices(actions: IExperimentActionChoice | undefined): IExperimentActionChoice {
        if (actions === undefined) {
            return EndScreenExperiment.getDefaultActions();
        }

        if (actions.color) {

            // light scheme can only use light colors
            if (actions.scheme === EndScreenExperimentDeclaration.scheme.LIGHT && ColorUtils.isDarkSchemeColor(actions.color)) {
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidSchemeAndColorCoordination);
                return EndScreenExperiment.getDefaultActions();
            }

            // dark scheme can only use dark colors
            if (actions.scheme === EndScreenExperimentDeclaration.scheme.DARK && !ColorUtils.isDarkSchemeColor(actions.color)) {
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidSchemeAndColorCoordination);
                return EndScreenExperiment.getDefaultActions();
            }
        }

        if (!EndScreenExperiment.isValid(actions)) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            return EndScreenExperiment.getDefaultActions();
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
            return ExperimentSquareEndScreenTemplate;
        }
        return ExperimentEndScreenTemplate;
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

    private onClickCollection(event: Event): void {
        event.preventDefault();

        if (this._clickHeatMapData.length >= 5) {
            this._clickHeatMapData.shift();
        }
        this._clickHeatMapData.push({
            x: (<MouseEvent>event).pageX,
            y: (<MouseEvent>event).pageY,
            target: (<HTMLElement>(<MouseEvent>event).target).className,
            normalizedX: (<MouseEvent>event).pageX / window.innerWidth,
            normalizedY: (<MouseEvent>event).pageY / window.innerHeight,
            orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
            width: window.innerWidth,
            height: window.innerHeight
        });
        console.log(this._clickHeatMapData);
    }
}
