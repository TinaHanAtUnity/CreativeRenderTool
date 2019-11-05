import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { Template } from 'Core/Utilities/Template';
import EndScreenAnimatedDownloadButton from 'html/EndScreenAnimatedDownloadButton.html';

export enum EndScreenAnimation {
  static = 'static',
  heartbeating = 'heartbeating',
  bouncing = 'bouncing',
  shining = 'shining'
}

export class AnimatedDownloadButtonEndScreen extends PerformanceEndScreen {
  private _animation: EndScreenAnimation;

  constructor(animation: EndScreenAnimation, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
    super(parameters, campaign, country);
    this._animation = animation;
    if (this._animation !== 'static') {
      this._template = new Template(EndScreenAnimatedDownloadButton, this._localization);
      this._templateData = {
        ...this._templateData,
        'hasShadow': animation === 'bouncing'
      };
    }
  }

  public render(): void {
    super.render();

    if (this._animation !== 'static') {
      this.container().classList.add(`${this._animation}-download-button-end-screen`);
    }
  }
}
