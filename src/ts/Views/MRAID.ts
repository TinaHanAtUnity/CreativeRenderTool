import MRAIDTemplate from 'html/MRAID.html';

import { NativeBridge } from 'Native/NativeBridge';
import { MRAIDView } from 'Views/MRAIDView';
import { Observable0 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Platform } from 'Constants/Platform';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Template } from 'Utilities/Template';

export class MRAID extends MRAIDView {

    private static CloseLength = 30;

    private readonly onLoaded = new Observable0();

    private _closeElement: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _loaded = false;

    private _messageListener: any;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;

    private _closeRemaining: number;
    private _showTimestamp: number;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign) {
        super(nativeBridge, 'mraid');

        this._placement = placement;
        this._campaign = campaign;

        this._template = new Template(MRAIDTemplate);

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

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');

        this.createMRAID().then(mraid => {
            iframe.srcdoc = mraid;
        });

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();

        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = MRAID.CloseLength;
            let skipRemaining = skipLength;
            const updateInterval = setInterval(() => {
                if(this._closeRemaining > 0) {
                    this._closeRemaining--;
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
                if (this._closeRemaining <= 0) {
                    clearInterval(updateInterval);
                    this._canClose = true;
                }
            }, 1000);
        } else {
            this._closeRemaining = MRAID.CloseLength;
            const updateInterval = setInterval(() => {
                const progress = (MRAID.CloseLength - this._closeRemaining) / MRAID.CloseLength;
                if(progress >= 0.75 && !this._didReward) {
                    this.onReward.trigger();
                    this._didReward = true;
                }
                if(this._closeRemaining > 0) {
                    this._closeRemaining--;
                    this.updateProgressCircle(this._closeElement, progress);
                }
                if (this._closeRemaining <= 0) {
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
    }

    public hide() {
        this._iframe.contentWindow.postMessage({
            type: 'viewable',
            value: false
        }, '*');
        if(this._messageListener) {
            window.removeEventListener('message', this._messageListener, false);
            this._messageListener = undefined;
        }
        super.hide();
    }

    public setViewableState(viewable: boolean) {
        if(this._loaded) {
            this._iframe.contentWindow.postMessage({
                type: 'viewable',
                value: viewable
            }, '*');
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

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            case 'loaded':
                this._loaded = true;
                this.onLoaded.trigger();
                break;

            case 'open':
                this.onClick.trigger(encodeURI(event.data.url));
                break;

            case 'close':
                this.onClose.trigger();
                break;

            case 'orientation':
                let forceOrientation = ForceOrientation.NONE;
                switch(event.data.properties.forceOrientation) {
                    case 'portrait':
                        forceOrientation = ForceOrientation.PORTRAIT;
                        break;

                    case 'landscape':
                        forceOrientation = ForceOrientation.LANDSCAPE;
                        break;

                    default:
                        break;
                }
                this.onOrientationProperties.trigger({
                    allowOrientationChange: event.data.properties.allowOrientationChange,
                    forceOrientation: forceOrientation
                });
                break;
            default:
                break;
        }
    }
}
