import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Template } from 'Core/Utilities/Template';
import VideoOverlaySkipTimer from 'html/VideoOverlaySkipTimer.html';

export class ProgressBarAndSkipVideoOverlay extends VideoOverlay {

  private _progressBar: HTMLElement;
  private _progressBarWrapper: HTMLElement;
  private _timerButton: HTMLElement;
  private _skipUnderTimerExperimentEnabled: boolean = false;

  constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean) {
    super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

    this._template = new Template(VideoOverlaySkipTimer, this._localization);

    if (CustomFeatures.isSkipUnderTimerExperimentEnabled(parameters.coreConfig, parameters.placement)) {
      this._templateData._skipUnderTimerExperimentEnabled = true;
      this._skipUnderTimerExperimentEnabled = true;
    }
  }

  public setVideoProgress(value: number): void {
    super.setVideoProgress(value);
    const progressInPercentages = (100 / this._videoDuration * this._videoProgress);
    if (this._progressBar.style.transition === '' && this._progressBar.style.webkitTransition === '') {
      this.addCssTransition();
    }
    this._progressBar.style.width = `${progressInPercentages}%`;

    if (progressInPercentages >= 100 && this._progressBarWrapper) {
      this._progressBarWrapper.remove();
    }

    if (this._skipRemaining <= 0) {
      if (this._skipUnderTimerExperimentEnabled) {
        this.hideTimerButton();
      }
    }
  }

  private hideTimerButton() {
    this._timerButton.style.display = 'none';
  }

  private addCssTransition(): void {
    // TODO: replace the magic number, as currently it's based on
    // the setVideoProgress method wich is called externally for every 250 ms.

    // The 0.2 value is taken based on the value of _progressInterval in VideoAdUnit.ts which is = 250
    // Used to smooth out slider animation
    // This value must be equal or less than the _progressInterval value.

    const transitionRule = `width ${0.2}s linear`;
    this._progressBar.style.transition = transitionRule;
    this._progressBar.style.webkitTransition = transitionRule;
  }

  private mountProgressBar(parentElement: HTMLElement): void {
    this._progressBarWrapper = <HTMLElement>document.createElement('div');
    this._progressBar = <HTMLElement>document.createElement('span');
    this._progressBar.classList.add('progress-bar');
    this._progressBarWrapper.classList.add('progress-wrapper');
    this._progressBarWrapper.appendChild(this._progressBar);
    this._container.classList.add('with-progress-bar');
    parentElement.insertBefore(this._progressBarWrapper, parentElement.childNodes[0] || null);
  }

  public render(): void {
    super.render();
    this.mountProgressBar(<HTMLElement>this._container.querySelector('.top-container'));
    this._timerButton = <HTMLElement>this._container.querySelector('.timer-button');
  }
}
