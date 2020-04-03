import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen, SQUARE_END_SCREEN } from 'Performance/Views/PerformanceEndScreen';
import EndScreenAnimatedDownloadButton from 'html/EndScreenAnimatedDownloadButton.html';
import SquareEndScreenAnimatedDownloadButtonTemplate from 'html/SquareEndScreenAnimatedDownloadButton.html';
import { IExperimentActionChoice } from 'Ads/Models/AutomatedExperiment';
import { ButtonAnimationsExperiment, ButtonExperimentDeclaration } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Color } from 'Core/Utilities/Color';

export class AnimatedDownloadButtonEndScreen extends PerformanceEndScreen {
    private _animation: string;
    private _bgColor: string;

    constructor(combination: IExperimentActionChoice, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
        super(parameters, campaign, country);
        if (!ButtonAnimationsExperiment.isValid(combination)) {
            combination = ButtonAnimationsExperiment.getDefaultActions();
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
        }
        this._bgColor = Color.hexToCssRgba(combination.color);
        this._animation = combination.animation;
        this._templateData = {
            ...this._templateData,
            'hasShadow': this._animation === ButtonExperimentDeclaration.animation.BOUNCING
        };
    }

    public render(): void {
        super.render();
        this._container.classList.add(`${this._animation}-download-button-end-screen`);
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            this._container.classList.add(`${this._animation}-download-button-end-screen-square`);
        }
        const ctaButton = <HTMLElement> this._container.querySelector('.download-container');
        if (ctaButton !== null) {
            ctaButton.style.backgroundColor = this._bgColor;
        }
    }

    private applyDarkMode() {
        document.body.classList.add('dark-mode');
    }

    public show(): void {
        super.show();
        window.addEventListener('resize', this.handleResize, false);
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('resize', this.handleResize);
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
