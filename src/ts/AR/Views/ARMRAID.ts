import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IARApi } from 'AR/AR';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IObserver0, IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { Localization } from 'Core/Utilities/Localization';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { Template } from 'Core/Utilities/Template';
import MRAIDContainer from 'html/mraid/container.html';
import WebARScript from 'html/mraid/webar.html';
import PlayableMRAIDTemplate from 'html/PlayableMRAID.html';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';

import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';

export class ARMRAID extends MRAIDView<IMRAIDViewHandler> {
    private static CloseLength = 30;

    protected _template: Template;
    private _ar: IARApi;
    private _deviceInfo: AndroidDeviceInfo;

    private _localization: Localization;

    private _closeElement: HTMLElement;
    private _loadingScreen: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _gdprBanner: HTMLElement;
    private _privacyButton: HTMLElement;
    private _cameraPermissionPanel: HTMLElement;
    private _permissionLearnMorePanel: HTMLElement;

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

    private _hasCameraPermission = false;
    private _permissionResultObserver: IObserver2<string, boolean>;

    constructor(platform: Platform, core: ICoreApi, ar: IARApi, deviceInfo: AndroidDeviceInfo, placement: Placement, campaign: MRAIDCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId: number) {
        super(platform, core, 'playable-mraid', placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId);

        this._ar = ar;
        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._localization = new Localization(language, 'loadingscreen');

        this._template = new Template(PlayableMRAIDTemplate, this._localization);

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
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.onPrivacyClicked(event);
                },
                selector: '.launch-privacy'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.onShowAr();
                },
                selector: '.permission-accept-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.onShowFallback();
                },
                selector: '.permission-decline-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.showARPermissionLearnMore();
                },
                selector: '.show-learn-more-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.hideARPermissionLearnMore();
                },
                selector: '.hide-learn-more-button'
            }
        ];
    }

    public render(): void {
        super.render();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._loadingScreen = <HTMLElement>this._container.querySelector('.loading-screen-ar');

        this._cameraPermissionPanel = <HTMLElement>this._container.querySelector('.camera-permission-panel');
        this._permissionLearnMorePanel = <HTMLElement>this._container.querySelector('.permissions-learn-more');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');
        this._gdprBanner = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement>this._container.querySelector('.privacy-button');

        ARUtil.isARSupported(this._ar).then(arSupported => {
            let container = MRAIDContainer;
            if (arSupported) {
                container = container.replace('<script id=\"webar\"></script>', WebARScript);
                iframe.classList.add('fullscreen');
            }

            this.createMRAID(container).then(mraid => {
                iframe.onload = () => this.onIframeLoaded();
                SdkStats.setFrameSetStartTimestamp(this._placement.getId());
                this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
                iframe.srcdoc = mraid;

                this._arFrameUpdatedObserver = this._ar.AR.onFrameUpdated.subscribe(parameters => this.handleAREvent('frameupdate', parameters));
                this._arPlanesAddedObserver = this._ar.AR.onPlanesAdded.subscribe(parameters => this.handleAREvent('planesadded', parameters));
                this._arPlanesUpdatedObserver = this._ar.AR.onPlanesUpdated.subscribe(parameters => this.handleAREvent('planesupdated', parameters));
                this._arPlanesRemovedObserver = this._ar.AR.onPlanesRemoved.subscribe(parameters => this.handleAREvent('planesremoved', parameters));
                this._arAnchorsUpdatedObserver = this._ar.AR.onAnchorsUpdated.subscribe(parameters => this.handleAREvent('anchorsupdated', parameters));
                this._arWindowResizedObserver = this._ar.AR.onWindowResized.subscribe((width, height) => this.handleAREvent('windowresized', JSON.stringify({
                    width,
                    height
                })));
                this._arErrorObserver = this._ar.AR.onError.subscribe(errorCode => this.handleAREvent('error', JSON.stringify({errorCode})));
                this._arSessionInterruptedObserver = this._ar.AR.onSessionInterrupted.subscribe(() => this.handleAREvent('sessioninterrupted', ''));
                this._arSessionInterruptionEndedObserver = this._ar.AR.onSessionInterruptionEnded.subscribe(() => this.handleAREvent('sessioninterruptionended', ''));
                if (this._platform === Platform.ANDROID) {
                    this._arAndroidEnumsReceivedObserver = this._ar.AR.Android.onAndroidEnumsReceived.subscribe((enums) => this.handleAREvent('androidenumsreceived', JSON.stringify(enums)));
                }
                this._deviceorientationListener = (event: DeviceOrientationEvent) => this.handleDeviceOrientation(event);
                window.addEventListener('deviceorientation', this._deviceorientationListener, false);
            }).catch((err) => {
                this._core.Sdk.logError('failed to create mraid: ' + err);

                SessionDiagnostics.trigger('create_mraid_error', {
                    message: err.message
                }, this._campaign.getSession());
            });
        });

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);

        this.choosePrivacyShown();
    }

    public setViewableState(viewable: boolean): void {
        if(this._iframeLoaded && !this._loadingScreenTimeout) {
            this._iframe.contentWindow!.postMessage({
                type: 'viewable',
                value: viewable
            }, '*');
        }

        // background time for analytics
        if(!viewable) {
            this._backgroundTimestamp = Date.now();
        } else {
            if (this._backgroundTimestamp) {
                this._backgroundTime += Date.now() - this._backgroundTimestamp;
            }
        }
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();
        const backgroundTime = this._backgroundTime / 1000;

        if (this.isKPIDataValid({backgroundTime}, 'ar_playable_show')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(0, 0, backgroundTime, 'playable_show', {}));
        }

        this.showLoadingScreen();
    }

    public hide() {
        this.setViewableState(false);

        if (this._arFrameUpdatedObserver) {
            this._ar.AR.onFrameUpdated.unsubscribe(this._arFrameUpdatedObserver);
            this._ar.AR.onPlanesAdded.unsubscribe(this._arPlanesAddedObserver);
            this._ar.AR.onPlanesUpdated.unsubscribe(this._arPlanesUpdatedObserver);
            this._ar.AR.onPlanesRemoved.unsubscribe(this._arPlanesRemovedObserver);
            this._ar.AR.onAnchorsUpdated.unsubscribe(this._arAnchorsUpdatedObserver);
            this._ar.AR.onWindowResized.unsubscribe(this._arWindowResizedObserver);
            this._ar.AR.onError.unsubscribe(this._arErrorObserver);
            this._ar.AR.onSessionInterrupted.unsubscribe(this._arSessionInterruptedObserver);
            this._ar.AR.onSessionInterruptionEnded.unsubscribe(this._arSessionInterruptionEndedObserver);
            if (this._platform === Platform.ANDROID) {
                this._ar.AR.Android.onAndroidEnumsReceived.unsubscribe(this._arAndroidEnumsReceivedObserver);
            }
            window.removeEventListener('deviceorientation', this._deviceorientationListener, false);

            if (this._permissionResultObserver) {
                this._core.Permissions.onPermissionsResult.unsubscribe(this._permissionResultObserver);
            }
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

    private showLoadingScreen() {
        this._loadingScreen.style.display = 'block';
        this._loadingScreenTimeout = setTimeout(() => {
            if(this._iframeLoaded) {
                this.showARPermissionPanel();
            } else {
                // start the prepare timeout and wait for the onload event
                this._prepareTimeout = setTimeout(() => {
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this._closeElement.style.display = 'block';
                    this.updateProgressCircle(this._closeElement, 1);

                    const resourceUrl = this._campaign.getResourceUrl();
                    SessionDiagnostics.trigger('playable_prepare_timeout', {
                        'url': resourceUrl ? resourceUrl.getOriginalUrl() : ''
                    }, this._campaign.getSession());

                    this._prepareTimeout = undefined;
                }, 4500);
            }
            this._loadingScreenTimeout = undefined;
        }, 2500);
    }

    private showMRAIDAd() {
        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = ARMRAID.CloseLength;
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
            this._closeRemaining = ARMRAID.CloseLength;
            const updateInterval = setInterval(() => {
                const progress = (ARMRAID.CloseLength - this._closeRemaining) / ARMRAID.CloseLength;
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
    }

    private updateProgressCircle(container: HTMLElement, value: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        if(this._platform === Platform.ANDROID && this._deviceInfo.getApiLevel() < 15) {
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

        const skip = this._canSkip && !this._canClose;
        const eventName = skip ? 'playable_skip' : 'playable_close';

        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const timeFromPlayableStart = (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;

        if (skip) {
            this._handlers.forEach(handler => handler.onMraidSkip());
        } else if (this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
        }

        if (this.isKPIDataValid({timeFromShow, timeFromPlayableStart, backgroundTime}, 'ar_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, undefined));
        }
    }

    private onIframeLoaded() {
        this._iframeLoaded = true;

        if(!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
            this.showARPermissionPanel();
        }

        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId()) / 1000);
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');

        const timeFromShow = (this._playableStartTimestamp - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;

        if (this.isKPIDataValid({timeFromShow, backgroundTime}, 'ar_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, timeFromShow, backgroundTime, 'playable_loading_time', {}));
        }
    }

    private handleAREvent(event: string, parameters: string) {
        if (this._iframeLoaded) {
            this._iframe.contentWindow!.postMessage({type: 'AREvent', data: {parameters, event}}, '*');
        }
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

    private onAREvent(event: MessageEvent): Promise<void> {
        if (!this._hasCameraPermission) {
            return Promise.resolve();
        }

        const { data } = event.data;
        const functionName = data.functionName;
        const args = data.args;

        switch (functionName) {
            case 'resetPose':
                return this._ar.AR.restartSession(args[0]);

            case 'setDepthNear':
                return this._ar.AR.setDepthNear(args[0]);

            case 'setDepthFar':
                return this._ar.AR.setDepthFar(args[0]);

            case 'showCameraFeed':
                return this._ar.AR.showCameraFeed();

            case 'hideCameraFeed':
                return this._ar.AR.hideCameraFeed();

            case 'addAnchor':
                return this._ar.AR.addAnchor(String(args[0]), args[1]);

            case 'removeAnchor':
                return this._ar.AR.removeAnchor(String(args[0]));

            case 'advanceFrame':
                if (this._platform === Platform.IOS) {
                    return ARUtil.advanceFrameWithScale(this._ar.AR.Ios);
                } else if (this._platform === Platform.ANDROID) {
                    return this._ar.AR.Android.advanceFrame();
                } else {
                    return Promise.resolve();
                }

            case 'log':
                return this._core.Sdk.logDebug('NATIVELOG ' + JSON.stringify(args));

            case 'initAR':
                if (this._platform === Platform.ANDROID) {
                    return this._ar.AR.Android.initAR();
                } else {
                    return Promise.resolve();
                }

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
                const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
                const timeFromPlayableStart = (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000;
                const backgroundTime = this._backgroundTime / 1000;

                if (this.isKPIDataValid({timeFromShow, timeFromPlayableStart, backgroundTime}, event.data.event)) {
                    this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, event.data.event, event.data.eventData));
                }
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
                this.onAREvent(event).catch((reason) => this._core.Sdk.logError('AR message error: ' + reason.toString()));
                break;
            default:
        }
    }

    private showARPermissionLearnMore() {
        this._permissionLearnMorePanel.style.display = 'block';
        this._closeElement.style.display = 'none';
    }

    private hideARPermissionLearnMore() {
        this._permissionLearnMorePanel.style.display = 'none';
        this._closeElement.style.display = 'block';
    }

    /**
     * showARPermissionPanel needs to be shown before the timer starts
     */
    private showARPermissionPanel() {
        ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
            if(this._loadingScreen.style.display === 'none') {
                return;
            }

            this._loadingScreen.addEventListener(e, () => {
                this._closeElement.style.display = 'block';

                this._playableStartTimestamp = Date.now();
                const timeFromShow = (this._playableStartTimestamp - this._showTimestamp - this._backgroundTime) / 1000;
                const backgroundTime = this._backgroundTime / 1000;

                if (this.isKPIDataValid({timeFromShow, backgroundTime}, 'ar_playable_start')) {
                    this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, 0, backgroundTime, 'playable_start', undefined));
                }

                this.setViewableState(true);

                this._loadingScreen.style.display = 'none';
            }, false);
        });

        ARUtil.isARSupported(this._ar).then(supported => {
            this._loadingScreen.classList.add('hidden');

            if (!supported) {
                this.onCameraPermissionEvent(false);
                return;
            }

            PermissionsUtil.checkPermissionInManifest(this._platform, this._core, PermissionTypes.CAMERA).then((available: boolean) => {
                if (!available) {
                    return CurrentPermission.DENIED;
                }
                return PermissionsUtil.checkPermissions(this._platform, this._core, PermissionTypes.CAMERA);
            }).then((results: CurrentPermission) => {
                const requestPermissionText = <HTMLElement>this._cameraPermissionPanel.querySelector('.request-text');
                if (results === CurrentPermission.DENIED) {
                    this.onCameraPermissionEvent(false);
                } else {
                    if (results === CurrentPermission.ACCEPTED) {
                        requestPermissionText.style.display = 'none';
                    }
                    this._cameraPermissionPanel.style.display = 'block';
                }
            });
        });
    }

    private onCameraPermissionEvent(hasCameraPermission: boolean) {
        this._hasCameraPermission = hasCameraPermission;
        this._iframe.contentWindow!.postMessage({
            type: 'permission',
            value: {
                type: 'Camera',
                status: hasCameraPermission
            }
        }, '*');

        this.showMRAIDAd();
        this._cameraPermissionPanel.classList.add('hidden');
    }

    private onShowAr() {
        this._permissionResultObserver = this._core.Permissions.onPermissionsResult.subscribe((permission, granted) => {
            if(permission === PermissionTypes.CAMERA) {
                this.onCameraPermissionEvent(granted);
            }
        });

        PermissionsUtil.requestPermission(this._platform, this._core, PermissionTypes.CAMERA);
    }

    private onShowFallback() {
        this.onCameraPermissionEvent(false);
    }

    private onPrivacyClicked(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        const url = (<HTMLLinkElement>event.target).href;
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
}
