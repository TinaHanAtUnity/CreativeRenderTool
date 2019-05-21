import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export class PerfomanceOverlayEventHandlerWithAmination extends PerformanceOverlayEventHandler {
    protected _performanceAdUnit: PerformanceAdUnit;
    private _gameBackgroundContainer: HTMLElement;

    private whichTransitionEvent(): string {
        const transitions: {[index: string]: string} = {
            'transition'      : 'transitionend',
            'OTransition'     : 'oTransitionEnd',
            'MozTransition'   : 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };
        let transition;
        for (const key in transitions) {
            if (transitions.hasOwnProperty(key)) {
                transition = transitions[key];
            }
        }
        return transition ? transition : 'transitionend';
    }

    public onOverlayAnimation (position: number): void {
        this._gameBackgroundContainer = <HTMLElement>document.getElementsByClassName('game-background-container')[0];
        const gameBackgroundContainer = this._gameBackgroundContainer;
        const endScreen = this._performanceAdUnit.getEndScreen();
        const endScreenElement = document.getElementById('end-screen');
        const transitionEvent = this.whichTransitionEvent();
        this._ads.VideoPlayer.pause();
        if (endScreenElement && gameBackgroundContainer) {
            endScreenElement.style.visibility = 'visible';
            endScreenElement.classList.add('on-show');
            gameBackgroundContainer.addEventListener(transitionEvent, () => {
                this.onOverlaySkip(position);
                if (endScreen) {
                    endScreen.show();
                }
                this._performanceAdUnit.onFinish.trigger();
            });
        } else {
            this.onOverlaySkip(position);
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
            this.onOverlayAnimation(position);
        }
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.SKIP);
    }

}
