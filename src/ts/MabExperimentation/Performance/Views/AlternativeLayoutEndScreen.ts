import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen, SQUARE_END_SCREEN } from 'Performance/Views/PerformanceEndScreen';
import EndScreenAlternativeLayout from 'html/mabexperimentation/EndScreenAlternativeLayout.html';
import SquareEndScreenAnimatedDownloadButtonTemplate from 'html/SquareEndScreenAnimatedDownloadButton.html';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { ButtonExperimentDeclaration, ButtonAnimationsExperiment } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Color } from 'Core/Utilities/Color';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { IColorTheme } from 'Performance/Utilities/Swatch';

export class AlternativeLayoutEndScreen extends PerformanceEndScreen {
    private _animation: string;
    private _downloadButtonColor: string;
    private _darkMode: boolean;
    private _tintColor: boolean;
    private _alternativeLayout: boolean;

    constructor(combination: IExperimentActionChoice | undefined, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);

        combination = this.fixupExperimentChoices(combination);

        // switch (combination.scheme) {
        //     case ButtonExperimentDeclaration.scheme.LIGHT:
        //         this._downloadButtonColor = Color.hexToCssRgba(combination.color);
        //         break;
        //     case ButtonExperimentDeclaration.scheme.DARK:
        //         // This is "pastel blue", to be cohesive with dark mode
        //         this._downloadButtonColor = Color.hexToCssRgba('#2ba3ff');
        //         this._darkMode = true;
        //         break;
        //     case ButtonExperimentDeclaration.scheme.COLORMATCHING:
        //         this._tintColor = true;
        //         break;
        //     default:
        // }
        const simpleRating = campaign.getRating().toFixed(1);
        this._templateData = {
            ...this._templateData,
            'simpleRating': simpleRating
        };
        this._animation = 'static';
        this._darkMode = false;
        this._tintColor = false;
        this._alternativeLayout = true;
        console.log(this._templateData)
    }

    private fixupExperimentChoices(actions: IExperimentActionChoice | undefined): IExperimentActionChoice {
        if (actions === undefined) {
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        if (!ButtonAnimationsExperiment.isValid(actions)) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            return ButtonAnimationsExperiment.getDefaultActions();
        }

        return actions;
    }

    public static experimentSupported(experimentID: string): boolean {
        // This is a temp implementation. simple implementation works for now as there is only on experiment supported.
        return experimentID === ButtonAnimationsExperiment.getName();
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
        Promise.all([deviceInfo.getScreenWidth(), deviceInfo.getScreenHeight()])
            .then(([screenWidth, screenHeight]) => {
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
                        .then(swatches => {
                            if (!swatches || !swatches.length) {
                                SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintSwitches);
                                return;
                            }

                            const baseColorTheme = swatches[0].getColorTheme();
                            const secondaryColorTheme = ((swatches.length > 1) ? swatches[1] : swatches[0]).getColorTheme();
                            this.applyColorTheme(baseColorTheme, secondaryColorTheme);
                        }).catch((msg: string) => {
                        SDKMetrics.reportMetricEventWithTags(AUIMetric.EndscreenColorTintError, {
                            'msg': msg
                        });
                    });
                }
            });
    }

    private applyColorTheme(baseColorTheme: IColorTheme, secondaryColorTheme: IColorTheme): void {
        if (!baseColorTheme.light || !baseColorTheme.medium || !baseColorTheme.dark ||
            !secondaryColorTheme.light || !secondaryColorTheme.medium || !secondaryColorTheme.dark) {
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenColorTintTheme);
            return;
        }

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',baseColorTheme)

        const gameInfoContainer: HTMLElement | null = this._container.querySelector('.game-info-container');
        const installContainer: HTMLElement | null = this._container.querySelector('.install-container');
        const gameNameContainer: HTMLElement | null = this._container.querySelector('.name-container');
        const gameRatingContainer: HTMLElement | null = this._container.querySelector('.game-rating-count');
        const privacyIconContainer: HTMLElement | null = this._container.querySelector('.bottom-container .icon-gdpr');
        const unityIconContainer: HTMLElement | null = this._container.querySelector('.bottom-container .unityads-logo');
        const chinaAdvertisementElement: HTMLElement | null = this._container.querySelector('.bottom-container .china-advertisement');

        gameInfoContainer ? gameInfoContainer.style.background = baseColorTheme.medium.toCssRgb() : null;
        installContainer ? installContainer.style.color = baseColorTheme.medium.toCssRgb() : null;
        
        if (gameInfoContainer && installContainer && gameNameContainer && gameRatingContainer && privacyIconContainer && unityIconContainer && chinaAdvertisementElement) {
            const secondary = Color.lerp(secondaryColorTheme.light, secondaryColorTheme.medium, 0.3);
            const baseDark = baseColorTheme.dark.toCssRgb();
            // backgroundElement.style.background = `linear-gradient(${secondary.toCssRgb()},${baseColorTheme.light.toCssRgb()})`;
            // gameNameContainer.style.color = baseDark;
            // gameRatingContainer.style.color = baseDark;
            // privacyIconContainer.style.color = baseDark;
            // unityIconContainer.style.color = baseDark;
            // chinaAdvertisementElement.style.color = baseDark;
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
        // if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
        //     return SquareEndScreenAnimatedDownloadButtonTemplate;
        // }
        return EndScreenAlternativeLayout;
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
