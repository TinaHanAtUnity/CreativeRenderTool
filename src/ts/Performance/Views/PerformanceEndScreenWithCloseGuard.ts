import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export class PerformanceEndScreenWithCloseGuard extends PerformanceEndScreen {

  private _isCloseBlocked: boolean = true;

  public show(): void {
    super.show();

    setTimeout(() => {
      this._isCloseBlocked = false;
    }, 500);
  }

  protected onCloseEvent(event: Event): void {
    if (this._isCloseBlocked) {
      return;
    }

    event.preventDefault();
    this._handlers.forEach(handler => handler.onEndScreenClose());
  }
}
