import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export class PerfomanceOverlayEventHandlerWithAmination extends PerformanceOverlayEventHandler {
    protected _performanceAdUnit: PerformanceAdUnit;

    public showEndScreenWithAnimation (position: number): void {
        const gameBackgroundContainer = <HTMLElement>document.getElementsByClassName('game-background-container')[0];
        const endScreen = this._performanceAdUnit.getEndScreen();
        const endScreenElement = document.getElementById('end-screen');
        this._ads.VideoPlayer.pause();
        if (endScreenElement && gameBackgroundContainer) {
            endScreenElement.style.visibility = 'visible';
            gameBackgroundContainer.addEventListener('transitionend', () => {
                super.onOverlaySkip(position);
                if (endScreen) {
                    endScreen.show();
                }
                this._performanceAdUnit.onFinish.trigger();
            });
            endScreenElement.classList.add('on-show');
        } else {
            super.onOverlaySkip(position);
            if (endScreen) {
                endScreen.show();
            }
            this._performanceAdUnit.onFinish.trigger();
        }
    }

    public onOverlaySkip(position: number): void {
        if (this._placement.skipEndCardOnClose()) {
            super.onOverlayClose();
        } else {
            this.showEndScreenWithAnimation(position);
        }
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.SKIP);
    }

}
