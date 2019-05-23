import { IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';

export class AnimatedVideoOverlay extends VideoOverlay implements IPrivacyHandlerView {
  protected _isEndScreenVisible: boolean;

  public setVideoProgress(value: number): void {
    super.setVideoProgress(value);
    const timerCount = Math.ceil((this._videoDuration - this._videoProgress) / 1000);
    const endScreen = window.document.getElementById('end-screen');
    if (timerCount <= 1 && !this._isEndScreenVisible) {
      this._isEndScreenVisible = true;
      if (endScreen) {
        endScreen.style.visibility = 'visible';
        endScreen.classList.add('on-show');
      }
    }
  }

  public render(): void {
    super.render();
    document.body.classList.add('animated-video-overlay-experiment');
  }
}
