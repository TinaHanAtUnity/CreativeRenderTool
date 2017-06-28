import MRAIDTemplate from 'html/MRAID.html';
import MRAIDContainer from 'html/mraid/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Platform } from 'Constants/Platform';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Template } from 'Utilities/Template';
import { Localization } from 'Utilities/Localization';
import { Diagnostics } from 'Utilities/Diagnostics';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: ForceOrientation;
}

export class MRAID extends View {

    public readonly onClick = new Observable0();
    public readonly onReward = new Observable0();
    public readonly onSkip = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onOrientationProperties = new Observable1<IOrientationProperties>();

    private _placement: Placement;
    private _campaign: MRAIDCampaign;
    private _localization: Localization;

    private _closeElement: HTMLElement;
    private _loadingScreen: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _iFrameLoaded = false;

    private _messageListener: any;
    private _resizeHandler: any;
    private _resizeDelayer: any;
    private _resizeTimeout: any;
    private _loadingScreenTimeout: any;
    private _prepareTimeout: any;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign, language: string) {
        super(nativeBridge, 'mraid');

        this._placement = placement;
        this._campaign = campaign;
        this._localization = new Localization(language, 'endscreen');

        this._template = new Template(MRAIDTemplate);

        if(campaign) {
            this._templateData = {
                'gameName': campaign.getGameName(),
            };
            const gameIcon = campaign.getGameIcon();
            if(gameIcon) {
                this._templateData.gameIcon = gameIcon.getUrl();
            }
            const rating = campaign.getRating();
            if(rating) {
                const adjustedRating: number = rating * 20;
                this._templateData.rating = adjustedRating.toString();
            }
            const ratingCount = campaign.getRatingCount();
            if(ratingCount) {
                this._templateData.ratingCount = this._localization.abbreviate(ratingCount);
            }

        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-region'
            }
        ];
    }

    public show(): void {
        super.show();

        const iframe: any = this._iframe;

        this._loadingScreenTimeout = setTimeout(() => {
            if(this._iFrameLoaded) {
                this.showPlayable();
            } else {
                this._prepareTimeout = setTimeout(() => {
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this._closeElement.style.display = 'block';
                    this.updateProgressCircle(this._closeElement, 1);

                    Diagnostics.trigger('playable_prepare_timeout', {
                        'url': this._campaign.getResource()
                    });

                }, 5000);
            }
            this._loadingScreenTimeout = undefined;
        }, 2000);

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

    public render() {
        super.render();

        // console.time('Load playable');

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._loadingScreen = <HTMLElement>this._container.querySelector('.loading-screen');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            if (Math.abs(<number>window.orientation) === 90) {
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

        this.createMRAID().then(mraid => {
            iframe.onload = () => this.onIframeLoaded();
            iframe.srcdoc = mraid;
        });

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);
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

    public createMRAID(): Promise<string> {
        return this.fetchMRAID().then(mraid => {
            const markup = this._campaign.getDynamicMarkup();
            if(markup) {
                mraid = mraid.replace('{UNITY_DYNAMIC_MARKUP}', markup);
            }

            return MRAIDContainer.replace('<body></body>', '<body>' + mraid.replace('<script src="mraid.js"></script>', '') + '</body>');
        });
    }

    private onIframeLoaded() {
        // console.timeEnd('Load playable');
        if(!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;

            this.showPlayable();
        }
        this._iFrameLoaded = true;
    }

    private showPlayable() {
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

        this._loadingScreen.classList.add('hidden');

        ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
            if (this._loadingScreen.style.display === 'none') {
                return;
            }

            this._loadingScreen.addEventListener(e, () => {
                this._closeElement.style.display = 'block';

                this._iframe.contentWindow.postMessage({
                    type: 'viewable',
                    value: true
                }, '*');

                this._loadingScreen.style.display = 'none';
            }, false);
        });
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
            case 'open':
                this.onClick.trigger();
                if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    this._nativeBridge.UrlScheme.open(encodeURI(event.data.url));
                } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': encodeURI(event.data.url) // todo: these come from 3rd party sources, should be validated before general MRAID support
                    });
                }
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

    private fetchMRAID(): Promise<string> {
        const resourceUrl = this._campaign.getResourceUrl();
        if(resourceUrl) {
            const fileId = resourceUrl.getFileId();
            if(fileId) {
                return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
            } else {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', () => {
                        resolve(xhr.responseText);
                    }, false);
                    xhr.open('GET', decodeURIComponent(resourceUrl.getOriginalUrl()));
                    xhr.send();
                });
            }
        } else {
            return Promise.resolve(this._campaign.getResource());
        }
    }

}
