import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { Template } from 'Core/Utilities/Template';
import EndScreenAnimatedDownloadButton from 'html/EndScreenAnimatedDownloadButton.html';

export class AnimatedDownloadButtonEndScreen extends PerformanceEndScreen {
  private _animation: string;

  constructor(animation: string, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country?: string) {
    super(parameters, campaign, country);
    this._animation = animation;
    this._template = new Template(EndScreenAnimatedDownloadButton, this._localization);
  }

  public render(): void {
    super.render();
    document.documentElement.classList.add(`${this._animation}-download-button-end-screen`);
  }
}
