import { View } from 'Views/View';
import DisplayInterstitialTemplate from 'html/display/DisplayInterstitial.html';
import DisplayContainer from 'html/display/DisplayContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { DisplayInterstitialCampaign } from 'Models/DisplayInterstitialCampaign';
import { Platform } from 'Constants/Platform';
import { Template } from 'Utilities/Template';

export class DisplayInterstitial extends View {

    public readonly onClick = new Observable1<string>();
    public readonly onReward = new Observable0();
    public readonly onSkip = new Observable0();
    public readonly onClose = new Observable0();

    private _placement: Placement;
    private _campaign: DisplayInterstitialCampaign;

    private _closeElement: HTMLElement;
    private _iframe: HTMLIFrameElement;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;
    private _markup: string;

    private _messageListener: EventListener;

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

        if (this._campaign.getClickThroughUrl()) {
            const clickCatcher = document.createElement('div');
            clickCatcher.classList.add('iframe-click-catcher');
            this._container.appendChild(clickCatcher);

            clickCatcher.addEventListener('click', (e: Event) => this.onIFrameClicked(e));
        }

        this._markup = this._campaign.getDynamicMarkup();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#display-iframe');

        if (this._campaign.getClickThroughUrl()) {
            iframe.srcdoc = this._markup;
        } else {
            iframe.srcdoc = DisplayContainer.replace('<body></body>', '<body>' + this._markup + '</body>');
        }

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            if(Math.abs(<number>window.orientation) === 90) {
                iframe.width = screen.height;
                iframe.height = screen.width;
            } else {
                iframe.width = screen.width;
                iframe.height = screen.height;
            }
        } else {
            iframe.height = window.innerHeight;
            iframe.width = window.innerWidth;
        }

    }

    public show(): void {
        super.show();

        window.addEventListener('message', this._messageListener);

        const closeLength = 30;

        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            let closeRemaining = closeLength;
            let skipRemaining = skipLength;
            const updateInterval = setInterval(() => {
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
                    clearInterval(updateInterval);
                    this._canClose = true;
                }
            }, 1000);
        } else {
            let closeRemaining = closeLength;
            const updateInterval = setInterval(() => {
                const progress = (closeLength - closeRemaining) / closeLength;
                if(progress >= 0.75 && !this._didReward) {
                    this.onReward.trigger();
                    this._didReward = true;
                }
                if(closeRemaining > 0) {
                    closeRemaining--;
                    this.updateProgressCircle(this._closeElement, progress);
                }
                if (closeRemaining <= 0) {
                    clearInterval(updateInterval);
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
            }, 1000);
        }
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);
        super.hide();
    }

    private onIFrameClicked(e: Event) {
        e.preventDefault();
        e.stopPropagation();

        const clickThroughUrl = this._campaign.getClickThroughUrl();
        if (clickThroughUrl) {
            this.onClick.trigger(clickThroughUrl);
        }
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
            this.onSkip.trigger();
        } else if(this._canClose) {
            this.onClose.trigger();
        }
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
            case 'redirect':
                this.onClick.trigger(e.data.href);
                break;
            default:
                this._nativeBridge.Sdk.logWarning(`Unknown message: ${e.data.type}`);
        }
    }
}
