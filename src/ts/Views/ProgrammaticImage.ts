import { View } from 'Views/View';
import ProgrammaticImageTemplate from 'html/Display.html';
import DisplayContainer from 'html/DisplayContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { ProgrammaticImageCampaign } from 'Models/ProgrammaticImageCampaign';
import { Platform } from 'Constants/Platform';
import { Template } from 'Utilities/Template';

export class ProgrammaticImage extends View {

    public readonly onClick = new Observable1<string>();
    public readonly onReward = new Observable0();
    public readonly onSkip = new Observable0();
    public readonly onClose = new Observable0();

    private readonly onLoaded = new Observable0();

    private _placement: Placement;
    private _campaign: ProgrammaticImageCampaign;

    private _closeElement: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _loaded = false;

    private _resizeHandler: any;
    private _resizeDelayer: any;
    private _resizeTimeout: any;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;
    private _markup: string;

    private _messageListener: EventListener;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: ProgrammaticImageCampaign) {
        super(nativeBridge, 'programmatic-image');

        this._placement = placement;
        this._campaign = campaign;

        this._template = new Template(ProgrammaticImageTemplate);
        this._messageListener = (e: Event) => this.onMessage(e);

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
        this._markup = this._campaign.getDynamicMarkup();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');
        iframe.srcdoc = DisplayContainer.replace('<body></body>', '<body>' + this._markup + '</body>');

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

        const iframe: any = this._iframe;
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

        if(this._loaded) {
            this._iframe.contentWindow.postMessage('viewable', '*');
        } else {
            const observer = this.onLoaded.subscribe(() => {
                this._iframe.contentWindow.postMessage({
                    type: 'viewable',
                    value: true
                }, '*');
                this.onLoaded.unsubscribe(observer);
            });
        }

        this._resizeDelayer = (event: Event) => {
            this._resizeTimeout = setTimeout(() => {
                this._resizeHandler(event);
            }, 200);
        };

        this._resizeHandler = (event: Event) => {
            iframe.width = window.innerWidth;
            iframe.height = window.innerHeight;
            if(this._iframe.contentWindow) {
                this._iframe.contentWindow.postMessage({
                    type: 'resize',
                    width: window.innerWidth,
                    height: window.innerHeight
                }, '*');
            }
        };

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            window.addEventListener('resize', this._resizeDelayer, false);
        } else {
            window.addEventListener('resize', this._resizeHandler, false);
        }
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);

        this._iframe.contentWindow.postMessage({
            type: 'viewable',
            value: false
        }, '*');
        if(this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler, false);
            this._resizeHandler = undefined;
        }
        if(this._resizeDelayer) {
            window.removeEventListener('resize', this._resizeDelayer, false);
            clearTimeout(this._resizeTimeout);
            this._resizeHandler = undefined;
        }
        super.hide();
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

    private onMessage(e: Event) {

    }
}
