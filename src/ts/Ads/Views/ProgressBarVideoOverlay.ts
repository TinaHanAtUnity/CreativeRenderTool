import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

export class ProgressBarVideoOverlay extends VideoOverlay {

  private _progressBar: HTMLElement;
  private _progressBarWrapper: HTMLElement;

  constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean) {
    super(parameters, privacy, showGDPRBanner, true);
  }

  public setVideoProgress(value: number): void {
    super.setVideoProgress(value);

    const progressInPercentages = Math.ceil(100 / this._videoDuration * this._videoProgress);

    if (this._progressBar.style.transition === '' && this._progressBar.style.webkitTransition === '') {
      this.addCssTransition();
    }
    this._progressBar.style.width = `${progressInPercentages}%`;

    if (progressInPercentages >= 100 && this._progressBarWrapper) {
      this._progressBarWrapper.remove();
    }
  }

  private addCssTransition(): void {
    const transitionRule = `width 0.29s linear`;
    this._progressBar.style.transition = transitionRule;
    this._progressBar.style.webkitTransition = transitionRule;
  }

  private mountProgressBar(parentElement: HTMLElement): void {
    this._progressBarWrapper = <HTMLElement>document.createElement('div');
    this._progressBar = <HTMLElement>document.createElement('span');
    this._progressBar.classList.add('progress-bar');
    this._progressBarWrapper.classList.add('progress-wrapper');
    this._progressBarWrapper.appendChild(this._progressBar);
    parentElement.insertBefore(this._progressBarWrapper, parentElement.childNodes[0] || null);
  }

  public render(): void {
    super.render();
    this.mountProgressBar(<HTMLElement>this._container.querySelector('.top-container'));
  }
}
