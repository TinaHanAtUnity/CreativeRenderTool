import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { IVideoOverlayDownloadParameters } from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

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
            endScreenElement.classList.add('on-show-animation');
        } else {
            super.onOverlaySkip(position);
        }
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        if (!parameters.skipEnabled) {
            // This is for the install now button test in rewarded ad video overlay.
            const operativeEventParams = this.getOperativeEventParams(parameters);
            this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            this._operativeEventManager.sendView(operativeEventParams);
        }
        this._storeHandler.onDownload(parameters);
        if (parameters.skipEnabled) {
            // there we calling super method becouse we need to skip
            // animation stage when the download button is clicked.
            super.onOverlaySkip(parameters.videoProgress);
        }
        this.setCallButtonEnabled(true);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.CLICK);
    }

    public onOverlaySkip(position: number): void {
        if (!this._placement.skipEndCardOnClose()) {
            this.showEndScreenWithAnimation(position);
        } else {
            super.onOverlaySkip(position);
        }
    }
}
