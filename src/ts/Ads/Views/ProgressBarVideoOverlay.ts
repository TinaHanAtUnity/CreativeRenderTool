import { VideoOverlay } from 'Ads/Views/VideoOverlay';
export class ProgressBarVideoOverlay extends VideoOverlay {

  private _progressBar: HTMLElement;
  private _progressBarWrapper: HTMLElement;
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
  }
}
