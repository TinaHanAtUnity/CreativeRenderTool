import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen, SQUARE_END_SCREEN } from 'Performance/Views/PerformanceEndScreen';
import EndScreenAnimatedDownloadButton from 'html/EndScreenAnimatedDownloadButton.html';
import SquareEndScreenAnimatedDownloadButtonTemplate from 'html/SquareEndScreenAnimatedDownloadButton.html';

export enum EndScreenAnimation {
  STATIC = 'static',
  HEARTBEATING = 'heartbeating',
  BOUNCING = 'bouncing',
  SHINING = 'shining'
}

export class AnimatedDownloadButtonEndScreen extends PerformanceEndScreen {
  private _animation: EndScreenAnimation;

  constructor(animation: EndScreenAnimation, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
    super(parameters, campaign, country);

    this._animation = animation;
    this._templateData = {
      ...this._templateData,
      'hasShadow': animation === EndScreenAnimation.BOUNCING
    };
  }

  public render(): void {
    super.render();
    this._container.classList.add(`${this._animation}-download-button-end-screen`);
    if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
        this._container.classList.add(`${this._animation}-download-button-end-screen-square`);
    }
  }

  protected getTemplate() {
    if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
        return SquareEndScreenAnimatedDownloadButtonTemplate;
    }
    return EndScreenAnimatedDownloadButton;
  }
}
