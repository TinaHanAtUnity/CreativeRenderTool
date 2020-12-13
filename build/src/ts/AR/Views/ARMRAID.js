import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { Platform } from 'Core/Constants/Platform';
import { Localization } from 'Core/Utilities/Localization';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { Template } from 'Core/Utilities/Template';
import MRAIDContainer from 'html/mraid/container.html';
import WebARScript from 'html/mraid/webar.html';
import ExtendedMRAIDTemplate from 'html/ExtendedMRAID.html';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { Color } from 'Core/Utilities/Color';
export class ARMRAID extends MRAIDView {
    constructor(platform, core, ar, deviceInfo, placement, campaign, language, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivacy, automatedExperimentManager, arUiExperiments) {
        super(platform, core, deviceInfo, 'extended-mraid', placement, campaign, privacy, showGDPRBanner, abGroup, !!hidePrivacy, gameSessionId);
        this._iframeLoaded = false;
        this._hasCameraPermission = false;
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
                listener: (event) => {
                    this.onPrivacyClicked(event);
                },
                selector: '.launch-privacy'
            },
            {
                event: 'click',
                listener: (event) => {
                    this.hideARPermissionPanel();
                    this.onShowAr();
                },
                selector: '.permission-accept-button'
            },
            {
                event: 'click',
                listener: (event) => {
                    this.hideARPermissionPanel();
                },
                selector: '.permission-decline-button'
            },
            {
                event: 'click',
                listener: (event) => {
                    if (this._arAvailableButton.classList.contains('ar-available-button--collapsed')
                        && this._arUiExperiments.skip === 'false') {
                        this.expandArAvailableButton();
                    }
                    else {
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
                listener: (event) => {
                    this.showARPermissionLearnMore();
                },
                selector: '.show-learn-more-button'
            },
            {
                event: 'click',
                listener: (event) => {
                    this.hideARPermissionLearnMore();
                },
                selector: '.hide-learn-more-button'
            }
        ]);
    }
    render() {
        super.render();
        this._loadingScreen = this._container.querySelector('.loading-screen-ar');
        this._cameraPermissionPanel = this._container.querySelector('.camera-permission-panel');
        this._permissionLearnMorePanel = this._container.querySelector('.permissions-learn-more');
        this._arAvailableButton = this._container.querySelector('.ar-available-button');
        const iframe = this._iframe = this._container.querySelector('#mraid-iframe');
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
            }).catch((err) => {
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
    setViewableState(viewable) {
        if (this._iframeLoaded && !this._loadingScreenTimeout) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }
        this._viewable = viewable;
        this.setAnalyticsBackgroundTime(viewable);
    }
    show() {
        super.show();
        this._showTimestamp = Date.now();
        const backgroundTime = this._backgroundTime / 1000;
        if (this.isKPIDataValid({ backgroundTime }, 'playable_show')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(0, 0, backgroundTime, 'playable_show', {}));
        }
        this.showLoadingScreen();
    }
    hide() {
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
    showLoadingScreen() {
        this._loadingScreen.style.display = 'block';
        this._loadingScreenTimeout = window.setTimeout(() => {
            if (this._iframeLoaded) {
                this.onShowFallback();
            }
            else {
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
    showMRAIDAd() {
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
        }
        else {
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
    onCloseEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        const skip = this._canSkip && !this._canClose;
        const eventName = skip ? 'playable_skip' : 'playable_close';
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const timeFromPlayableStart = (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        if (skip) {
            this._handlers.forEach(handler => handler.onMraidSkip());
        }
        else if (this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
        }
        if (this.isKPIDataValid({ timeFromShow, timeFromPlayableStart, backgroundTime }, eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, undefined));
        }
    }
    sendMraidAnalyticsEvent(eventName, eventData) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const timeFromPlayableStart = (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        if (this.isKPIDataValid({ timeFromShow, timeFromPlayableStart, backgroundTime }, eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }
    onIframeLoaded() {
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
    handleAREvent(event, parameters) {
        if (this._iframeLoaded) {
            this._iframe.contentWindow.postMessage({ type: 'AREvent', data: { parameters, event } }, '*');
        }
    }
    onAREvent(event) {
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
                }
                else if (this._platform === Platform.ANDROID) {
                    return this._ar.AR.Android.advanceFrame();
                }
                else {
                    return Promise.resolve();
                }
            case 'swapBuffers':
                if (this._platform === Platform.ANDROID) {
                    return this._ar.AR.Android.swapBuffers();
                }
                else {
                    return Promise.resolve();
                }
            case 'log':
                return this._core.Sdk.logDebug('NATIVELOG ' + JSON.stringify(args));
            case 'initAR':
                if (this._platform === Platform.ANDROID) {
                    return this._ar.AR.Android.initAR();
                }
                else {
                    return Promise.resolve();
                }
            default:
                throw new Error('Unknown AR message');
        }
    }
    showARPermissionLearnMore() {
        this._permissionLearnMorePanel.style.display = 'block';
        this._closeElement.style.display = 'none';
        this._permissionLearnMoreOpen = true;
    }
    hideARPermissionLearnMore() {
        this._permissionLearnMorePanel.style.display = 'none';
        this._closeElement.style.display = 'block';
        this._permissionLearnMoreOpen = false;
    }
    showARPermissionPanel() {
        if (this._arCameraAlreadyAccepted) {
            this.sendMraidAnalyticsEvent('camera_permission_user_already_accepted', undefined);
            this.onShowAr();
            return;
        }
        this._cameraPermissionPanel.classList.remove('hidden');
        this._cameraPermissionPanel.style.display = 'block';
        this._gdprBanner.classList.add('mraid-container');
    }
    hideARPermissionPanel() {
        this._cameraPermissionPanel.classList.add('hidden');
        this._gdprBanner.classList.remove('mraid-container');
    }
    onCameraPermissionEvent(hasCameraPermission) {
        this._hasCameraPermission = hasCameraPermission;
        this._iframe.contentWindow.postMessage({
            type: 'permission',
            value: {
                type: 'Camera',
                status: hasCameraPermission
            }
        }, '*');
        this.showMRAIDAd();
    }
    onShowAr() {
        if (!this._arCameraAlreadyAccepted) {
            const observer = this._core.Permissions.onPermissionsResult.subscribe((permission, granted) => {
                if (permission === PermissionTypes.CAMERA) {
                    this._core.Permissions.onPermissionsResult.unsubscribe(observer);
                    if (granted) {
                        // send event only if permission is granted, otherwise would reload fallback scene
                        this.onCameraPermissionEvent(true);
                        this.sendMraidAnalyticsEvent('camera_permission_user_accepted', undefined);
                    }
                    else {
                        this.sendMraidAnalyticsEvent('camera_permission_user_rejected', undefined);
                    }
                }
            });
            PermissionsUtil.requestPermission(this._platform, this._core, PermissionTypes.CAMERA);
            this.sendMraidAnalyticsEvent('permission_dialog_system_show', undefined);
        }
        else {
            this.onCameraPermissionEvent(true);
        }
    }
    onShowFallback() {
        this.sendMraidAnalyticsEvent('permission_dialog_fallback_mode', undefined);
        this.hideLoadingScreen();
        this.onCameraPermissionEvent(false);
    }
    hideLoadingScreen() {
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
    hideArAvailableButton() {
        if (this._arButtonCollapseTimeout) {
            clearTimeout(this._arButtonCollapseTimeout);
            this._arButtonCollapseTimeout = undefined;
        }
        this._arAvailableButton.classList.add('hidden');
        this._arAvailableButton.style.display = 'none';
        this._arAvailableButton.classList.remove('ar-available-button--collapsed', 'ar-available-button--expanded');
    }
    showArAvailableButton() {
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
            PermissionsUtil.checkPermissionInManifest(this._platform, this._core, PermissionTypes.CAMERA).then((available) => {
                if (!available) {
                    return CurrentPermission.NOT_IN_MANIFEST;
                }
                return PermissionsUtil.checkPermissions(this._platform, this._core, PermissionTypes.CAMERA);
            }).then((result) => {
                if (result === CurrentPermission.NOT_IN_MANIFEST) {
                    this._arAvailableButton.classList.add('hidden');
                    this.sendMraidAnalyticsEvent('app_camera_permission_not_in_manifest', undefined);
                }
                else if (result === CurrentPermission.DENIED) {
                    this._arAvailableButton.classList.add('hidden');
                    this.sendMraidAnalyticsEvent('app_camera_permission_denied', undefined);
                }
                else {
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
    collapseArAvailableButtonDelayed() {
        if (this._arButtonCollapseTimeout) {
            clearTimeout(this._arButtonCollapseTimeout);
            this._arButtonCollapseTimeout = undefined;
        }
        this._arButtonCollapseTimeout = window.setTimeout(() => {
            this._arAvailableButton.classList.add('ar-available-button--collapsed');
            this._arAvailableButton.classList.remove('ar-available-button--expanded');
        }, 5000);
    }
    expandArAvailableButton() {
        this._arAvailableButton.classList.remove('ar-available-button--collapsed');
        this._arAvailableButton.classList.add('ar-available-button--expanded');
        this.collapseArAvailableButtonDelayed();
    }
    onArReadyToShowEvent(msg) {
        this.showArAvailableButton();
        return Promise.resolve();
    }
    onArButtonHideEvent(msg) {
        this.hideArAvailableButton();
        return Promise.resolve();
    }
    onPrivacyClicked(event) {
        event.stopPropagation();
        event.preventDefault();
        const url = event.target.href;
        if (this._platform === Platform.IOS) {
            this._core.iOS.UrlScheme.open(url);
        }
        else if (this._platform === Platform.ANDROID) {
            this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
}
ARMRAID.CloseLength = 30;
ARMRAID.AutoBeginTimeout = 5;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQVJNUkFJRC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BUi9WaWV3cy9BUk1SQUlELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUd0RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ2pHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLGNBQWMsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLFdBQVcsTUFBTSx1QkFBdUIsQ0FBQztBQUNoRCxPQUFPLHFCQUFxQixNQUFNLHlCQUF5QixDQUFDO0FBRTVELE9BQU8sRUFBcUIsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFckUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFFcEYsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFcEcsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTdDLE1BQU0sT0FBTyxPQUFRLFNBQVEsU0FBNEI7SUF1Q3JELFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsRUFBVSxFQUFFLFVBQXNCLEVBQUUsU0FBb0IsRUFBRSxRQUF1QixFQUFFLFFBQWdCLEVBQUUsT0FBd0IsRUFBRSxjQUF1QixFQUFFLE9BQWdCLEVBQUUsYUFBcUIsRUFBRSxXQUFnQyxF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