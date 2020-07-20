import { Placement } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IARApi } from 'AR/AR';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { IObserver0, IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { Localization } from 'Core/Utilities/Localization';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { Template } from 'Core/Utilities/Template';
import MRAIDContainer from 'html/mraid/container.html';
import WebARScript from 'html/mraid/webar.html';
import ExtendedMRAIDTemplate from 'html/ExtendedMRAID.html';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { Color } from 'Core/Utilities/Color';

export class ARMRAID extends MRAIDView<IMRAIDViewHandler> {
    private static CloseLength = 30;
    private static AutoBeginTimeout = 5;

    private _ar: IARApi;

    private _localization: Localization;

    private _loadingScreen: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _cameraPermissionPanel: HTMLElement;
    private _permissionLearnMorePanel: HTMLElement;
    private _permissionLearnMoreOpen: boolean;
    private _arAvailableButton: HTMLElement;
    private _arCameraAlreadyAccepted: boolean;
    private _arAvailableButtonShown: boolean;

    private _iframeLoaded = false;

    private _loadingScreenTimeout?: number;
    private _prepareTimeout?: number;
    private _arButtonCollapseTimeout?: number;

    private _arFrameUpdatedObserver: IObserver1<string>;
    private _arPlanesAddedObserver: IObserver1<string>;
    private _arPlanesUpdatedObserver: IObserver1<string>;
    private _arPlanesRemovedObserver: IObserver1<string>;
    private _arAnchorsUpdatedObserver: IObserver1<string>;
    private _arWindowResizedObserver: IObserver2<number, number>;
    private _arErrorObserver: IObserver1<number>;
    private _arSessionInterruptedObserver: IObserver0;
    private _arSessionInterruptionEndedObserver: IObserver0;
    private _arAndroidEnumsReceivedObserver: IObserver1<unknown>;
    private _arUiExperiments: IExperimentActionChoice;
    private _automatedExperimentManager: AutomatedExperimentManager;

    private _hasCameraPermission = false;
    private _viewable: boolean;

    constructor(platform: Platform, core: ICoreApi, ar: IARApi, deviceInfo: DeviceInfo, placement: Placement, campaign: MRAIDCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId: number, hidePrivacy: boolean | undefined, automatedExperimentManager: AutomatedExperimentManager, arUiExperiments: IExperimentActionChoice) {
        super(platform, core, deviceInfo, 'extended-mraid', placement, campaign, privacy, showGDPRBanner, abGroup, !!hidePrivacy, gameSessionId);

        this._ar = ar;
        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._localization = new Localization(language, 'mraid');
        this._arUiExperiments = arUiExperiments;
        this._automatedExperimentManager = automatedExperimentManager;
        this._template = new Template(ExtendedMRAIDTemplate, this._localization);
        this._permissionLearnMoreOpen = false;
        this._viewable = false;
        this._arAvailableButtonShown = false;

        this._bindings = this._bindings.concat([
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
                    this.hideARPermissionPanel();
                    this.onShowAr();
                },
                selector: '.permission-accept-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.hideARPermissionPanel();
                },
                selector: '.permission-decline-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    if (this._arAvailableButton.classList.contains('ar-available-button--collapsed')
                        && this._arUiExperiments.skip === 'false') {
                        this.expandArAvailableButton();
                    } else {
                        this.hideArAvailableButton();
                        this.showARPermissionPanel();
                        this.sendMraidAnalyticsEvent('ar_button_tapped', undefined);
                        this._automatedExperimentManager.rewardSelectedExperiment(campaign, AutomatedExperimentsCategories.MRAID_AR);
                    }
                },
                selector: '.ar-available-button'
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
        ]);
    }

    public render(): void {
        super.render();

        this._loadingScreen = <HTMLElement> this._container.querySelector('.loading-screen-ar');

        this._cameraPermissionPanel = <HTMLElement> this._container.querySelector('.camera-permission-panel');
        this._permissionLearnMorePanel = <HTMLElement> this._container.querySelector('.permissions-learn-more');
        this._arAvailableButton = <HTMLElement> this._container.querySelector('.ar-available-button');

        const iframe = this._iframe = <HTMLIFrameElement> this._container.querySelector('#mraid-iframe');

        ARUtil.isARSupported(this._ar).then(arSupported => {
            let container = MRAIDContainer;
            if (arSupported) {
                container = container.replace('<script id=\"webar\"></script>', WebARScript);
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
                this._arErrorObserver = this._ar.AR.onError.subscribe(errorCode => this.handleAREvent('error', JSON.stringify({ errorCode })));
                this._arSessionInterruptedObserver = this._ar.AR.onSessionInterrupted.subscribe(() => this.handleAREvent('sessioninterrupted', ''));
                this._arSessionInterruptionEndedObserver = this._ar.AR.onSessionInterruptionEnded.subscribe(() => this.handleAREvent('sessioninterruptionended', ''));
                if (this._platform === Platform.ANDROID) {
                    this._arAndroidEnumsReceivedObserver = this._ar.AR.Android.onAndroidEnumsReceived.subscribe((enums) => this.handleAREvent('androidenumsreceived', JSON.stringify(enums)));
                }
            }).catch((err: Error) => {
                this._core.Sdk.logError('failed to create mraid: ' + err.message);

                SessionDiagnostics.trigger('create_mraid_error', {
                    message: err.message
                }, this._campaign.getSession());
            });
        });

        this._mraidAdapterContainer.connect(new MRAIDIFrameEventAdapter(this._core, this._mraidAdapterContainer, iframe));

        // MAB - AR Available Button Color
        this._arAvailableButton.style.backgroundColor = Color.hexToCssRgba(this._arUiExperiments.color);
    }

    public setViewableState(viewable: boolean): void {
        if (this._iframeLoaded && !this._loadingScreenTimeout) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }

        this._viewable = viewable;
        this.setAnalyticsBackgroundTime(viewable);
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();
        const backgroundTime = this._backgroundTime / 1000;

        if (this.isKPIDataValid({ backgroundTime }, 'playable_show')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(0, 0, backgroundTime, 'playable_show', {}));
        }

        this.showLoadingScreen();
    }

    public hide() {
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
        }

        if (this._loadingScreenTimeout) {
            clearTimeout(this._loadingScreenTimeout);
            this._loadingScreenTimeout = undefined;
        }

        if (this._prepareTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
        }

        super.hide();
        this._mraidAdapterContainer.disconnect();

        this._automatedExperimentManager.endSelectedExperiment(this._campaign, AutomatedExperimentsCategories.MRAID_AR);
    }

    private showLoadingScreen() {
        this._loadingScreen.style.display = 'block';
        this._loadingScreenTimeout = window.setTimeout(() => {
            if (this._iframeLoaded) {
                this.onShowFallback();
            } else {
                // start the prepare timeout and wait for the onload event
                this._prepareTimeout = window.setTimeout(() => {
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
        // do not start timer if already running, may happen when switching between fallback and AR modes
        if (this._updateInterval) {
            return;
        }

        if (this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = ARMRAID.CloseLength;
            let skipRemaining = skipLength;
            this._updateInterval = window.setInterval(() => {
                if (this._closeRemaining > 0) {
                    this._closeRemaining--;
                }
                if (skipRemaining > 0) {
                    skipRemaining--;
                    this.updateProgressCircle(this._closeElement, (skipLength - skipRemaining) / skipLength);
                }
                if (skipRemaining <= 0) {
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
            this._updateInterval = window.setInterval(() => {
                const progress = (ARMRAID.CloseLength - this._closeRemaining) / ARMRAID.CloseLength;
                if (progress >= 0.75 && !this._didReward) {
                    this._handlers.forEach(handler => handler.onMraidReward());
                    this._didReward = true;
                }
                if (this._closeRemaining > 0) {
                    this._closeRemaining--;
                    this.updateProgressCircle(this._closeElement, progress);
                }
                if (this._closeRemaining <= 0) {
                    clearInterval(this._updateInterval);
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
            }, 1000);
        }
    }

    protected onCloseEvent(event: Event): void {
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

        if (this.isKPIDataValid({ timeFromShow, timeFromPlayableStart, backgroundTime }, eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, undefined));
        }
    }

    protected sendMraidAnalyticsEvent(eventName: string, eventData?: unknown): void {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const timeFromPlayableStart = (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;

        if (this.isKPIDataValid({ timeFromShow, timeFromPlayableStart, backgroundTime }, eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }

    private onIframeLoaded() {
        this._iframeLoaded = true;

        if (!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
            this.onShowFallback();
        }

        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId()) / 1000);
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');

        const timeFromShow = (this._playableStartTimestamp - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;

        if (this.isKPIDataValid({ timeFromShow, backgroundTime }, 'playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, timeFromShow, backgroundTime, 'playable_loading_time', {}));
        }
    }

    private handleAREvent(event: string, parameters: string) {
        if (this._iframeLoaded) {
            this._iframe.contentWindow!.postMessage({ type: 'AREvent', data: { parameters, event } }, '*');
        }
    }

    protected onAREvent(event: MessageEvent): Promise<void> {
        if (!this._hasCameraPermission) {
            return Promise.resolve();
        }

        const functionName = event.data.functionName;
        const args = event.data.args;

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

            case 'swapBuffers':
                if (this._platform === Platform.ANDROID) {
                    return this._ar.AR.Android.swapBuffers();
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

    private showARPermissionLearnMore() {
        this._permissionLearnMorePanel.style.display = 'block';
        this._closeElement.style.display = 'none';
        this._permissionLearnMoreOpen = true;
    }

    private hideARPermissionLearnMore() {
        this._permissionLearnMorePanel.style.display = 'none';
        this._closeElement.style.display = 'block';
        this._permissionLearnMoreOpen = false;
    }

    private showARPermissionPanel() {
        if (this._arCameraAlreadyAccepted) {
            this.sendMraidAnalyticsEvent('camera_permission_user_already_accepted', undefined);
            this.onShowAr();
            return;
        }

        this._cameraPermissionPanel.classList.remove('hidden');
        this._cameraPermissionPanel.style.display = 'block';
        this._gdprBanner.classList.add('mraid-container');
    }

    private hideARPermissionPanel() {
        this._cameraPermissionPanel.classList.add('hidden');
        this._gdprBanner.classList.remove('mraid-container');
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
    }

    private onShowAr() {
        if (!this._arCameraAlreadyAccepted) {
            const observer = this._core.Permissions.onPermissionsResult.subscribe((permission, granted) => {
                if (permission === PermissionTypes.CAMERA) {
                    this._core.Permissions.onPermissionsResult.unsubscribe(observer);

                    if (granted) {
                        // send event only if permission is granted, otherwise would reload fallback scene
                        this.onCameraPermissionEvent(true);
                        this.sendMraidAnalyticsEvent('camera_permission_user_accepted', undefined);
                    } else {
                        this.sendMraidAnalyticsEvent('camera_permission_user_rejected', undefined);
                    }
                }
            });

            PermissionsUtil.requestPermission(this._platform, this._core, PermissionTypes.CAMERA);
            this.sendMraidAnalyticsEvent('permission_dialog_system_show', undefined);
        } else {
            this.onCameraPermissionEvent(true);
        }
    }

    private onShowFallback() {
        this.sendMraidAnalyticsEvent('permission_dialog_fallback_mode', undefined);
        this.hideLoadingScreen();
        this.onCameraPermissionEvent(false);
    }

    private hideLoadingScreen() {
        ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
            if (this._loadingScreen.style.display === 'none') {
                return;
            }

            this._loadingScreen.addEventListener(e, () => {
                this._closeElement.style.display = 'block';

                this._playableStartTimestamp = Date.now();
                const timeFromShow = (this._playableStartTimestamp - this._showTimestamp - this._backgroundTime) / 1000;
                const backgroundTime = this._backgroundTime / 1000;

                if (this.isKPIDataValid({ timeFromShow, backgroundTime }, 'playable_start')) {
                    this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, 0, backgroundTime, 'playable_start', undefined));
                }

                this.setViewableState(true);

                this._loadingScreen.style.display = 'none';
            }, false);
        });
        this._loadingScreen.classList.add('hidden');
    }

    private hideArAvailableButton() {
        if (this._arButtonCollapseTimeout) {
            clearTimeout(this._arButtonCollapseTimeout);
            this._arButtonCollapseTimeout = undefined;
        }
        this._arAvailableButton.classList.add('hidden');
        this._arAvailableButton.style.display = 'none';
        this._arAvailableButton.classList.remove('ar-available-button--collapsed', 'ar-available-button--expanded');
    }

    private showArAvailableButton() {
        if (this._arAvailableButtonShown) {
            this._arAvailableButton.classList.remove('hidden');
            this._arAvailableButton.style.display = 'inline-flex';
            this.collapseArAvailableButtonDelayed();
            return;
        }

        ARUtil.isARSupported(this._ar).then(supported => {
            this._loadingScreen.classList.add('hidden');

            if (!supported) {
                this.sendMraidAnalyticsEvent('ar_not_supported', undefined);
                return;
            }

            PermissionsUtil.checkPermissionInManifest(this._platform, this._core, PermissionTypes.CAMERA).then((available: boolean) => {
                if (!available) {
                    return CurrentPermission.NOT_IN_MANIFEST;
                }
                return PermissionsUtil.checkPermissions(this._platform, this._core, PermissionTypes.CAMERA);
            }).then((result: CurrentPermission) => {
                if (result === CurrentPermission.NOT_IN_MANIFEST) {
                    this._arAvailableButton.classList.add('hidden');
                    this.sendMraidAnalyticsEvent('app_camera_permission_not_in_manifest', undefined);
                } else if (result === CurrentPermission.DENIED) {
                    this._arAvailableButton.classList.add('hidden');
                    this.sendMraidAnalyticsEvent('app_camera_permission_denied', undefined);
                } else {
                    // the user can see ar content
                    this._arCameraAlreadyAccepted = false;

                    if (result === CurrentPermission.ACCEPTED) {
                        this._arCameraAlreadyAccepted = true;
                    }

                    this.sendMraidAnalyticsEvent('ar_button_displayed', undefined);
                    this._arAvailableButton.classList.remove('hidden', 'ar-available-button--collapsed', 'ar-available-button--expanded');
                    this._arAvailableButton.style.display = 'inline-flex';
                    this._arAvailableButtonShown = true;
                    this.collapseArAvailableButtonDelayed();
                }
            });
        });
    }

    private collapseArAvailableButtonDelayed() {
        if (this._arButtonCollapseTimeout) {
            clearTimeout(this._arButtonCollapseTimeout);
            this._arButtonCollapseTimeout = undefined;
        }

        this._arButtonCollapseTimeout = window.setTimeout(() => {
            this._arAvailableButton.classList.add('ar-available-button--collapsed');
            this._arAvailableButton.classList.remove('ar-available-button--expanded');
        }, 5000);
    }

    private expandArAvailableButton() {
        this._arAvailableButton.classList.remove('ar-available-button--collapsed');
        this._arAvailableButton.classList.add('ar-available-button--expanded');
        this.collapseArAvailableButtonDelayed();
    }

    protected onArReadyToShowEvent(msg: MessageEvent): Promise<void> {
        this.showArAvailableButton();
        return Promise.resolve();
    }

    protected onArButtonHideEvent(msg: MessageEvent): Promise<void> {
        this.hideArAvailableButton();
        return Promise.resolve();
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
