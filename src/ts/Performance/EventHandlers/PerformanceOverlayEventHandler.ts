import {
    IVideoOverlayDownloadParameters,
    OverlayEventHandlerWithDownloadSupport
} from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { IStoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { AnimationEndCardTest } from 'Core/Models/ABGroup';
// import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
// import { Campaign } from 'Ads/Models/Campaign';

export class PerformanceOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport<PerformanceCampaign> {

    protected _performanceAdUnit: PerformanceAdUnit;
    protected _thirdPartyEventManager: ThirdPartyEventManager;
    private _gameBackgroundContainer: HTMLElement;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        super.onOverlayDownload(parameters);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.CLICK);
    }

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
                super.onOverlaySkip(position);
                if (endScreen) {
                    endScreen.show();
                }
                this._performanceAdUnit.onFinish.trigger();
            });
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
            if (AnimationEndCardTest.isValid(5)) {
                this.onOverlayAnimation(position);
            } else {
                const endScreen = this._performanceAdUnit.getEndScreen();
                super.onOverlaySkip(position);
                if (endScreen) {
                    endScreen.show();
                }
                this._performanceAdUnit.onFinish.trigger();
            }
        }
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.SKIP);
    }
}
