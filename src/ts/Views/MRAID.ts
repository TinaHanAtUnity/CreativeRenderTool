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
import { WebViewError } from 'Errors/WebViewError';
import { Localization } from 'Utilities/Localization';
import { Diagnostics } from 'Utilities/Diagnostics';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: ForceOrientation;
}

export class MRAID extends View {

    public readonly onClick = new Observable1<string>();
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
    private _iframeLoaded = false;

    private _messageListener: any;
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
        if(this._campaign.getAbGroup() === 5) {
            this._loadingScreen.style.display = 'block';
            this._loadingScreenTimeout = setTimeout(() => {
                if(this._iframeLoaded) {
                    this.showPlayable();
                } else {
                    this._prepareTimeout = setTimeout(() => {
                        this._canClose = true;
                        this._closeElement.style.opacity = '1';
                        this._closeElement.style.display = 'block';
                        this.updateProgressCircle(this._closeElement, 1);

                        const resourceUrl = this._campaign.getResourceUrl();
                        Diagnostics.trigger('playable_prepare_timeout', {
                            'url': resourceUrl ? resourceUrl.getOriginalUrl() : ''
                        });

                        this._prepareTimeout = undefined;
                    }, 5000);
                }
                this._loadingScreenTimeout = undefined;
            }, 1500);
        } else {
            if(this._iframeLoaded) {
                this.showPlayable();
            } else {
                // onIframeLoaded function handles load events
            }
        }
    }

    public render() {
        super.render();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._loadingScreen = <HTMLElement>this._container.querySelector('.loading-screen');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');

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

        if(this._loadingScreenTimeout) {
            clearTimeout(this._loadingScreenTimeout);
            this._loadingScreenTimeout = undefined;
        }

        if(this._prepareTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
        }
        super.hide();
    }

    public createMRAID(): Promise<string> {
        return this.fetchMRAID().then(mraid => {
            if(mraid) {
                const markup = this._campaign.getDynamicMarkup();
                if(markup) {
                    mraid = mraid.replace('{UNITY_DYNAMIC_MARKUP}', markup);
                }
                return MRAIDContainer.replace('<body></body>', '<body>' + mraid.replace('<script src="mraid.js"></script>', '') + '</body>');
            }
            throw new WebViewError('Unable to fetch MRAID');
        });
    }

    public setViewableState(viewable: boolean) {
        if(this._iframeLoaded && !this._loadingScreenTimeout) {
            this._iframe.contentWindow.postMessage({
                type: 'viewable',
                value: viewable
            }, '*');
        }
    }

    private onIframeLoaded() {
        this._iframeLoaded = true;

        if(!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;

            this.showPlayable();
        }
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

        if(this._campaign.getAbGroup() === 5) {
            ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
                if(this._loadingScreen.style.display === 'none') {
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

            this._loadingScreen.classList.add('hidden');
        } else {
            this._closeElement.style.display = 'block';
            this._iframe.contentWindow.postMessage({
                type: 'viewable',
                value: true
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

    private fetchMRAID(): Promise<string | undefined> {
        const resourceUrl = this._campaign.getResourceUrl();
        if (resourceUrl) {
            if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', () => {
                        resolve(xhr.responseText);
                    }, false);
                    xhr.open('GET', decodeURIComponent(resourceUrl.getUrl()));
                    xhr.send();
                });
            } else {
                const fileId = resourceUrl.getFileId();
                if (fileId) {
                    return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
                }
            }
        }
        return Promise.resolve(this._campaign.getResource());
    }

}
