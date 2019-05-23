import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';

export class PerfomanceOverlayEventHandlerWithAmination extends PerformanceOverlayEventHandler {
    protected _performanceAdUnit: PerformanceAdUnit;

    public showEndScreenWithAnimation (position: number): void {
        const gameBackgroundContainer = <HTMLElement>document.getElementsByClassName('game-background-container')[0];
        const endScreenElement = document.getElementById('end-screen');
        this._ads.VideoPlayer.pause();
        if (endScreenElement && gameBackgroundContainer) {
            endScreenElement.style.visibility = 'visible';
            ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
                gameBackgroundContainer.addEventListener(e, () => {
                    super.onOverlaySkip(position);
                });
            });
            endScreenElement.classList.add('on-show');
        } else {
            super.onOverlaySkip(position);
        }
    }

    public onOverlaySkip(position: number): void {
        if (!this._placement.skipEndCardOnClose()) {
            this.showEndScreenWithAnimation(position);
        } else {
            super.onOverlaySkip(position);
        }
    }
}
