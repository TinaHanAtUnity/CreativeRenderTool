import PlayableMRAIDTemplate from 'html/PlayableMRAID.html';
import MRAIDContainer from 'html/mraid/container.html';
import WebARScript from 'html/mraid/webar.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Platform } from 'Constants/Platform';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Template } from 'Utilities/Template';
import { Localization } from 'Utilities/Localization';
import { Diagnostics } from 'Utilities/Diagnostics';
import { IMRAIDViewHandler, MRAIDView } from 'Views/MRAIDView';
import { IObserver0, IObserver1, IObserver2 } from 'Utilities/IObserver';
import { SdkStats } from 'Utilities/SdkStats';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { CustomFeatures } from 'Utilities/CustomFeatures';
import { ARUtil } from '../Utilities/ARUtil';

export class PlayableMRAID extends MRAIDView<IMRAIDViewHandler> {

    private static CloseLength = 30;

    private _localization: Localization;

    private _closeElement: HTMLElement;
    private _loadingScreen: HTMLElement;
    private _loadingScreenAR: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _gdprBanner: HTMLElement;
    private _privacyButton: HTMLElement;

    private _iframeLoaded = false;

    private _messageListener: any;
    private _deviceorientationListener: any;
    private _loadingScreenTimeout: any;
    private _prepareTimeout: any;
    private _updateInterval: any;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;

    private _closeRemaining: number;
    private _showTimestamp: number;
    private _playableStartTimestamp: number;
    private _backgroundTime: number = 0;
    private _backgroundTimestamp: number;

    private _configuration: any;

    private _arFrameUpdatedObserver: IObserver1<string>;
    private _arPlanesAddedObserver: IObserver1<string>;
    private _arPlanesUpdatedObserver: IObserver1<string>;
    private _arPlanesRemovedObserver: IObserver1<string>;
    private _arAnchorsUpdatedObserver: IObserver1<string>;
    private _arWindowResizedObserver: IObserver2<number, number>;
    private _arErrorObserver: IObserver1<number>;
    private _arSessionInterruptedObserver: IObserver0;
    private _arSessionInterruptionEndedObserver: IObserver0;
    private _arAndroidEnumsReceivedObserver: IObserver1<any>;

    private _isMRAIDAR: boolean = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(nativeBridge, 'playable-mraid', placement, campaign, privacy, showGDPRBanner);

        this._placement = placement;
        this._campaign = campaign;
        this._localization = new Localization(language, 'loadingscreen');

        this._template = new Template(PlayableMRAIDTemplate, this._localization);

        if(campaign) {
            this._templateData = {
                'gameName': campaign.getGameName()
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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.onGDPRPopupEvent(event);
                    this.choosePrivacyShown();
                },
                selector: '.gdpr-link'
            }
        ];
    }

    public render(): void {
        super.render();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._loadingScreen = <HTMLElement>this._container.querySelector('.loading-screen');
        this._loadingScreenAR = <HTMLElement>this._container.querySelector('.loading-screen-ar');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');
        this._gdprBanner = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement>this._container.querySelector('.privacy-button');

        let container = MRAIDContainer;
        const playableConfiguration = this._campaign.getPlayableConfiguration();
        if(playableConfiguration) {
            // check configuration based on the ab group
            const groupKey = 'group' + this._campaign.getAbGroup();
            if(playableConfiguration[groupKey]) {
                this._configuration = playableConfiguration[groupKey];
            } else if (playableConfiguration.default) {
                this._configuration = playableConfiguration.default;
            } else {
                this._configuration = {};
            }
            container = container.replace('var playableConfiguration = {};', 'var playableConfiguration = ' + JSON.stringify(this._configuration) + ';');
        }

        // TODO: Remove /ar/ folder check once we have MRAID-AR type support on the server side
        const isARURL = ARUtil.isARCreative(this._campaign);
        this._isMRAIDAR = this._campaign.getAdType() === 'MRAID-AR' || isARURL;
        if (this._isMRAIDAR) {
            container = container.replace('<script id=\"webar\"></script>', WebARScript);
            iframe.classList.add('fullscreen');
        }
        this.createMRAID(container).then(mraid => {
            iframe.onload = () => this.onIframeLoaded();
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;
            if (this._isMRAIDAR) {
                this._arFrameUpdatedObserver = this._nativeBridge.AR.onFrameUpdated.subscribe(parameters => this.handleAREvent('frameupdate', parameters));
                this._arPlanesAddedObserver = this._nativeBridge.AR.onPlanesAdded.subscribe(parameters => this.handleAREvent('planesadded', parameters));
                this._arPlanesUpdatedObserver = this._nativeBridge.AR.onPlanesUpdated.subscribe(parameters => this.handleAREvent('planesupdated', parameters));
                this._arPlanesRemovedObserver = this._nativeBridge.AR.onPlanesRemoved.subscribe(parameters => this.handleAREvent('planesremoved', parameters));
                this._arAnchorsUpdatedObserver = this._nativeBridge.AR.onAnchorsUpdated.subscribe(parameters => this.handleAREvent('anchorsupdated', parameters));
                this._arWindowResizedObserver = this._nativeBridge.AR.onWindowResized.subscribe((width, height) => this.handleAREvent('windowresized', JSON.stringify({
                    width,
                    height
                })));
                this._arErrorObserver = this._nativeBridge.AR.onError.subscribe(errorCode => this.handleAREvent('error', JSON.stringify({errorCode})));
                this._arSessionInterruptedObserver = this._nativeBridge.AR.onSessionInterrupted.subscribe(() => this.handleAREvent('sessioninterrupted', ''));
                this._arSessionInterruptionEndedObserver = this._nativeBridge.AR.onSessionInterruptionEnded.subscribe(() => this.handleAREvent('sessioninterruptionended', ''));
                this._arAndroidEnumsReceivedObserver = this._nativeBridge.AR.onAndroidEnumsReceived.subscribe((enums) => this.handleAREvent('androidenumsreceived', JSON.stringify(enums)));
                this._deviceorientationListener = (event: DeviceOrientationEvent) => this.handleDeviceOrientation(event);
                window.addEventListener('deviceorientation', this._deviceorientationListener, false);
            }
        });

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);

        this.choosePrivacyShown();
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();
        if (this._isMRAIDAR) {
            this.showLoadingScreenAR();
        } else {
            this.showLoadingScreen();
        }
    }

    public hide() {
        this._iframe.contentWindow!.postMessage({
            type: 'viewable',
            value: false
        }, '*');

        if (this._arFrameUpdatedObserver) {
            this._nativeBridge.AR.onFrameUpdated.unsubscribe(this._arFrameUpdatedObserver);
            this._nativeBridge.AR.onPlanesAdded.unsubscribe(this._arPlanesAddedObserver);
            this._nativeBridge.AR.onPlanesUpdated.unsubscribe(this._arPlanesUpdatedObserver);
            this._nativeBridge.AR.onPlanesRemoved.unsubscribe(this._arPlanesRemovedObserver);
            this._nativeBridge.AR.onAnchorsUpdated.unsubscribe(this._arAnchorsUpdatedObserver);
            this._nativeBridge.AR.onWindowResized.unsubscribe(this._arWindowResizedObserver);
            this._nativeBridge.AR.onError.unsubscribe(this._arErrorObserver);
            this._nativeBridge.AR.onSessionInterrupted.unsubscribe(this._arSessionInterruptedObserver);
            this._nativeBridge.AR.onSessionInterruptionEnded.unsubscribe(this._arSessionInterruptionEndedObserver);
            this._nativeBridge.AR.onAndroidEnumsReceived.unsubscribe(this._arAndroidEnumsReceivedObserver);
            window.removeEventListener('deviceorientation', this._deviceorientationListener, false);
        }

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

        if(this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }
        super.hide();
    }

    public setViewableState(viewable: boolean) {
        if(this._iframeLoaded && !this._loadingScreenTimeout) {
            this._iframe.contentWindow!.postMessage({
                type: 'viewable',
                value: viewable
            }, '*');

            // background time for analytics
            if(!viewable) {
                this._backgroundTimestamp = Date.now();
            } else {
                if (this._backgroundTimestamp) {
                    this._backgroundTime += Date.now() - this._backgroundTimestamp;
                }
            }
        }
    }

    protected choosePrivacyShown(): void {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
        } else {
            this._privacyButton.style.visibility = 'visible';
            this._gdprBanner.style.pointerEvents = '1';
            this._gdprBanner.style.visibility = 'hidden';
        }
    }

    private onIframeLoaded() {
        this._iframeLoaded = true;

        if(!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;

            this.showMRAIDAd();
        }

        const frameLoadDuration = Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId());
        this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' ms');
    }

    private handleDeviceOrientation(event: DeviceOrientationEvent) {
        if (this._iframeLoaded) {
            this._iframe.contentWindow!.postMessage({
                type: 'deviceorientation',
                event: {
                    alpha: event.alpha,
                    beta: event.beta,
                    gamma: event.gamma,
                    absolute: event.absolute
                }
            }, '*');
        }
    }

    private showLoadingScreen() {
        this._loadingScreen.style.display = 'block';
        this._loadingScreenTimeout = setTimeout(() => {
            if(this._iframeLoaded) {
                this.showMRAIDAd();
            } else {
                // start the prepare timeout and wait for the onload event
                this._prepareTimeout = setTimeout(() => {
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this._closeElement.style.display = 'block';
                    this.updateProgressCircle(this._closeElement, 1);

                    const resourceUrl = this._campaign.getResourceUrl();
                    Diagnostics.trigger('playable_prepare_timeout', {
                        'url': resourceUrl ? resourceUrl.getOriginalUrl() : ''
                    }, this._campaign.getSession());

                    this._prepareTimeout = undefined;
                }, 4500);
            }
            this._loadingScreenTimeout = undefined;
        }, 2500);
    }

    private showLoadingScreenAR() {
        this._loadingScreenAR.style.display = 'block';
        if (this._iframeLoaded) {
            this.showMRAIDAd();
        }

        this._closeElement.style.opacity = '1';
        this._closeElement.style.display = 'block';
        this.updateProgressCircle(this._closeElement, 1);
    }

    private showMRAIDAd() {
        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = PlayableMRAID.CloseLength;
            let skipRemaining = skipLength;
            this._updateInterval = setInterval(() => {
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
                    clearInterval(this._updateInterval);
                    this._canClose = true;
                }
            }, 1000);
        } else {
            this._closeRemaining = PlayableMRAID.CloseLength;
            const updateInterval = setInterval(() => {
                const progress = (PlayableMRAID.CloseLength - this._closeRemaining) / PlayableMRAID.CloseLength;
                if(progress >= 0.75 && !this._didReward) {
                    this._handlers.forEach(handler => handler.onMraidReward());
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

        ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
            if(this._loadingScreen.style.display === 'none') {
                return;
            }

            const loadingScreen = this._isMRAIDAR ? this._loadingScreenAR : this._loadingScreen;

            loadingScreen.addEventListener(e, () => {
                this._closeElement.style.display = 'block';

                this._playableStartTimestamp = Date.now();
                const timeFromShow = this.checkIsValid((this._playableStartTimestamp - this._showTimestamp) / 1000);
                const backgroundTime = this.checkIsValid(this._backgroundTime / 1000);
                this._handlers.forEach(handler => handler.onMraidAnalyticsEvent(timeFromShow, 0, backgroundTime, 'playable_start', undefined));
                this._iframe.contentWindow!.postMessage({
                    type: 'viewable',
                    value: true
                }, '*');

                this._loadingScreen.style.display = 'none';
            }, false);
        });

        this._loadingScreen.classList.add('hidden');
        this._loadingScreenAR.classList.add('hidden');
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
        const timeFromShow = this.checkIsValid((Date.now() - this._showTimestamp) / 1000);
        const timeFromPlayableStart = this.checkIsValid((Date.now() - this._playableStartTimestamp) / 1000);
        const backgroundTime = this.checkIsValid(this._backgroundTime / 1000);

        if(this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            if (this._isMRAIDAR) {
                this._handlers.forEach(handler => handler.onMraidAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, 'playable_skip', undefined));
            }
        } else if(this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            if (this._isMRAIDAR) {
                this._handlers.forEach(handler => handler.onMraidAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, 'playable_close', undefined));
            }
        }
    }

    private onAREvent(event: MessageEvent): Promise<void> {
        const { data } = event.data;
        const functionName = data.functionName;
        const args = data.args;

        switch (functionName) {
            case 'resetPose':
                return this._nativeBridge.AR.restartSession(args[0]);

            case 'setDepthNear':
                return this._nativeBridge.AR.setDepthNear(args[0]);

            case 'setDepthFar':
                return this._nativeBridge.AR.setDepthFar(args[0]);

            case 'showCameraFeed':
                return this._nativeBridge.AR.showCameraFeed();

            case 'hideCameraFeed':
                return this._nativeBridge.AR.hideCameraFeed();

            case 'addAnchor':
                return this._nativeBridge.AR.addAnchor(args[0], args[1]);

            case 'removeAnchor':
                return this._nativeBridge.AR.removeAnchor(args[0]);

            case 'advanceFrame':
                return this._nativeBridge.AR.advanceFrame();

            case 'log':
                return this._nativeBridge.Sdk.logDebug('NATIVELOG ' + JSON.stringify(args));

            case 'initAR':
                return this._nativeBridge.AR.initAR();

            default:
                throw new Error('Unknown AR message');
        }
    }

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            case 'open':
                this._handlers.forEach(handler => handler.onMraidClick(encodeURI(event.data.url)));
                break;
            case 'close':
                this._handlers.forEach(handler => handler.onMraidClose());
                break;
            case 'orientation':
                let forceOrientation = Orientation.NONE;
                switch(event.data.properties.forceOrientation) {
                    case 'portrait':
                        forceOrientation = Orientation.PORTRAIT;
                        break;

                    case 'landscape':
                        forceOrientation = Orientation.LANDSCAPE;
                        break;

                    default:
                }
                this._handlers.forEach(handler => handler.onMraidOrientationProperties({
                    allowOrientationChange: event.data.properties.allowOrientationChange,
                    forceOrientation: forceOrientation
                }));
                break;
            case 'analyticsEvent':
                const timeFromShow = this.checkIsValid((Date.now() - this._showTimestamp) / 1000);
                const timeFromPlayableStart = this.checkIsValid((Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000);
                const backgroundTime = this.checkIsValid(this._backgroundTime / 1000);
                this._handlers.forEach(handler => handler.onMraidAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, event.data.event, event.data.eventData));
                break;
            case 'customMraidState':
                switch(event.data.state) {
                    case 'completed':
                        if(!this._placement.allowSkip() && this._closeRemaining > 5) {
                            this._closeRemaining = 5;
                        }
                        break;
                    case 'showEndScreen':
                        break;
                    default:
                }
                break;
            case 'ar':
                this.onAREvent(event).catch((reason) => this._nativeBridge.Sdk.logError('AR message error: ' + reason.toString()));
                break;
            default:
        }
    }

    private checkIsValid(timeInSeconds: number): number | undefined {
        if (timeInSeconds < 0 || timeInSeconds > 600) {
            return undefined;
        }
        return timeInSeconds;
    }

    private handleAREvent(event: string, parameters: string) {
        if (this._iframeLoaded) {
            this._iframe.contentWindow!.postMessage({type: 'AREvent', data: {parameters, event}}, '*');
        }
    }
}
