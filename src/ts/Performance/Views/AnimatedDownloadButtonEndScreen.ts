import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { Template } from 'Core/Utilities/Template';
import EndScreenAnimatedDownloadButton from 'html/EndScreenAnimatedDownloadButton.html';

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
    this._template = new Template(EndScreenAnimatedDownloadButton, this._localization);
    this._templateData = {
      ...this._templateData,
      'hasShadow': animation === EndScreenAnimation.BOUNCING
    };
  }

  public render(): void {
    super.render();
    this._container.classList.add(`${this._animation}-download-button-end-screen`);
  }
}