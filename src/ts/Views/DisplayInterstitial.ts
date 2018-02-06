import DisplayInterstitialTemplate from 'html/display/DisplayInterstitial.html';
import DisplayContainer from 'html/display/DisplayContainer.html';

import { View } from 'Views/View';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { Platform } from 'Constants/Platform';
import { Template } from 'Utilities/Template';

export interface IDisplayInterstitialHandler {
    onDisplayInterstitialReward(): void;
    onDisplayInterstitialSkip(): void;
    onDisplayInterstitialClose(): void;
}

export class DisplayInterstitial extends View<IDisplayInterstitialHandler> {

    private _placement: Placement;
    private _campaign: DisplayInterstitialCampaign;

    private _closeElement: HTMLElement;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;
    private _webPlayerPrepared = false;

    private _messageListener: EventListener;
    private _timers: number[] = [];

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: DisplayInterstitialCampaign) {
        super(nativeBridge, 'display-interstitial');

        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(DisplayInterstitialTemplate);

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-region'
            }
        ];
    }

    public render() {
        super.render();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
    }

    public show(): void {
        super.show();

        window.addEventListener('message', this._messageListener);

        const closeLength = 5;

        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            let closeRemaining = closeLength;
            let skipRemaining = skipLength;
            const updateInterval = window.setInterval(() => {
                if(closeRemaining > 0) {
                    closeRemaining--;
                }
                if(skipRemaining > 0) {
                    skipRemaining--;
                    this.updateProgressCircle(this._closeElement, (skipLength - skipRemaining) / skipLength);
                }
                if(skipRemaining <= 0) {
                    this._canSkip = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
                if (closeRemaining <= 0) {
                    this.clearTimer(updateInterval);
                    this._canClose = true;
                }
            }, 1000);
            this._timers.push(updateInterval);
        } else {
            let closeRemaining = closeLength;
            const updateInterval = window.setInterval(() => {
                const progress = (closeLength - closeRemaining) / closeLength;
                if(progress >= 0.75 && !this._didReward) {
                    this._handlers.forEach(handler => handler.onDisplayInterstitialReward());
                    this._didReward = true;
                }
                if(closeRemaining > 0) {
                    closeRemaining--;
                    this.updateProgressCircle(this._closeElement, progress);
                }
                if (closeRemaining <= 0) {
                    this.clearTimer(updateInterval);
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
            }, 1000);
            this._timers.push(updateInterval);
        }
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);
        super.hide();

        for (const timer of this._timers) {
            window.clearInterval(timer);
        }
        this._timers = [];
    }

    private clearTimer(handle: number) {
        const indx = this._timers.indexOf(handle);
        if (indx !== -1) {
            this._timers.splice(indx, 1);
        }
        window.clearInterval(handle);
    }

    private updateProgressCircle(container: HTMLElement, value: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }

        const leftCircleElement = <HTMLElement>container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>container.querySelector('.circle-right');

        const degrees = value * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(value >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if(this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onDisplayInterstitialSkip());
        } else if(this._canClose) {
            this._handlers.forEach(handler => handler.onDisplayInterstitialClose());
        }
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
            case 'redirect':
                // TODO: should we do something here?
                // this._handlers.forEach(handler => handler.onDisplayInterstitialClick(e.data.href));
                break;
            default:
                this._nativeBridge.Sdk.logWarning(`Unknown message: ${e.data.type}`);
        }
    }
}
