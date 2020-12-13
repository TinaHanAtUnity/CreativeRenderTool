import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Url } from 'Core/Utilities/Url';
export class DisplayInterstitialAdUnit extends AbstractAdUnit {
    constructor(parameters) {
        super(parameters);
        this._receivedOnPageStart = false;
        this._clickEventHasBeenSent = false;
        this._handlingShouldOverrideUrlLoading = false;
        this._contentReady = false;
        this._privacyShowing = false;
        this._topWebViewAreaMinHeight = 60;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._view = parameters.view;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._deviceInfo = parameters.deviceInfo;
        this._clientInfo = parameters.clientInfo;
        this._webPlayerContainer = parameters.webPlayerContainer;
        this._view.render();
        document.body.appendChild(this._view.container());
        this._options = parameters.options;
        this.setShowing(false);
        if (parameters.platform === Platform.ANDROID) {
            this._topWebViewAreaHeight = Math.floor(this.getAndroidViewSize(this._topWebViewAreaMinHeight, this.getScreenDensity()));
        }
        else {
            this._topWebViewAreaHeight = this._topWebViewAreaMinHeight;
        }
    }
    show() {
        this.setShowing(true);
        this._onPageStartedObserver = this._webPlayerContainer.onPageStarted.subscribe((url) => this.onPageStarted(url));
        this._shouldOverrideUrlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url, method) => this.shouldOverrideUrlLoading(url, method));
        return this.setWebPlayerViews().then(() => {
            this._view.show();
            this.onStart.trigger();
            this._ads.Listener.sendStartEvent(this._placement.getId());
            this.sendStartEvents();
            this._container.addEventHandler(this);
            this.setupPrivacyObservers();
            // Display ads are always completed.
            this.setFinishState(FinishState.COMPLETED);
            return Promise.resolve();
        });
    }
    hide() {
        if (!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);
        this._container.removeEventHandler(this);
        this._webPlayerContainer.onPageStarted.unsubscribe(this._onPageStartedObserver);
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._shouldOverrideUrlLoadingObserver);
        if (this._view) {
            this._view.hide();
            const viewContainer = this._view.container();
            if (viewContainer && viewContainer.parentElement) {
                viewContainer.parentElement.removeChild(viewContainer);
            }
        }
        this.onFinish.trigger();
        this.unsetReferences();
        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        return this._container.close().then(() => {
            return this._webPlayerContainer.clearSettings().then(() => {
                this.onClose.trigger();
            });
        });
    }
    description() {
        return 'programmaticImage';
    }
    onContainerShow() {
        if (this._contentReady) {
            return;
        }
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
        const promises = [
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ];
        Promise.all(promises).then(([screenWidth, screenHeight]) => {
            return this.setWebPlayerViewFrame(screenWidth, screenHeight)
                .then(() => this.setWebViewViewFrame(screenWidth, screenHeight, this._privacyShowing))
                .then(() => this.setWebPlayerContent());
        });
    }
    onContainerDestroy() {
        if (this.isShowing()) {
            this.onClose.trigger();
        }
    }
    onContainerBackground() {
        if (this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.hide();
        }
        // EMPTY
    }
    onContainerForeground() {
        // EMPTY
    }
    onContainerSystemMessage(message) {
        // EMPTY
    }
    getScreenDensity() {
        if (this._platform === Platform.ANDROID) {
            return this._deviceInfo.getScreenDensity();
        }
        return 0;
    }
    hasCreativeSize() {
        return this._campaign.getWidth() !== undefined && this._campaign.getHeight() !== undefined;
    }
    setWebPlayerViewFrame(screenWidth, screenHeight) {
        let creativeWidth = screenWidth;
        let creativeHeight = screenHeight;
        if (this._platform === Platform.ANDROID && this.hasCreativeSize()) {
            const screenDensity = this.getScreenDensity();
            creativeWidth = Math.floor(this.getAndroidViewSize(this._campaign.getWidth() || screenWidth, screenDensity));
            creativeHeight = Math.floor(this.getAndroidViewSize(this._campaign.getHeight() || screenHeight, screenDensity));
        }
        const xPos = Math.floor((screenWidth / 2) - (creativeWidth / 2));
        const yPos = Math.floor((screenHeight / 2) - (creativeHeight / 2));
        return this._container.setViewFrame('webplayer', xPos, yPos, creativeWidth, creativeHeight);
    }
    setWebViewViewFrame(screenWidth, screenHeight, shouldFullScreen) {
        if (shouldFullScreen) {
            return this._container.setViewFrame('webview', 0, 0, screenWidth, screenHeight);
        }
        else {
            return this._container.setViewFrame('webview', 0, 0, screenWidth, this._topWebViewAreaHeight);
        }
    }
    onPageStarted(url) {
        this._core.Sdk.logDebug('DisplayInterstitialAdUnit: onPageStarted triggered for url: ' + url);
        if (!this._receivedOnPageStart) {
            this._receivedOnPageStart = true;
            return;
        }
        if (this._clickEventHasBeenSent) {
            return;
        }
        this._operativeEventManager.sendClick(this.getOperativeEventParams());
        this.sendTrackingEvent(TrackingEvent.CLICK);
        this._clickEventHasBeenSent = true;
    }
    shouldOverrideUrlLoading(url, method) {
        if (this._handlingShouldOverrideUrlLoading) {
            return;
        }
        this._handlingShouldOverrideUrlLoading = true;
        if (this._platform && url === 'about:blank') {
            this.setWebplayerSettings(false).then(() => {
                this._handlingShouldOverrideUrlLoading = false;
            });
            return;
        }
        this._core.Sdk.logDebug('DisplayInterstitialAdUnit: shouldOverrideUrlLoading triggered for url: "' + url);
        if (!url || !Url.isProtocolWhitelisted(url, this._platform)) {
            this._handlingShouldOverrideUrlLoading = false;
            return;
        }
        this.openUrlInBrowser(url);
    }
    openUrlInBrowser(url) {
        let openPromise;
        if (this._platform === Platform.IOS) {
            openPromise = this._core.iOS.UrlScheme.open(url);
        }
        else {
            openPromise = this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
        return Promise.resolve(openPromise).then(() => {
            this._handlingShouldOverrideUrlLoading = false;
        }).catch((e) => {
            this._core.Sdk.logWarning('DisplayInterstitialAdUnit: Cannot open url: "' + url + '": ' + e);
            this._handlingShouldOverrideUrlLoading = false;
        });
    }
    unsetReferences() {
        delete this._view;
    }
    sendStartEvents() {
        this.sendTrackingEvent(TrackingEvent.IMPRESSION);
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this.onStartProcessed.trigger();
        });
        // Temporary for PTS Migration Investigation
        this.sendTrackingEvent(TrackingEvent.START);
    }
    setWebPlayerViews() {
        const platform = this._platform;
        let webPlayerSettings;
        if (platform === Platform.ANDROID) {
            webPlayerSettings = {
                setJavaScriptCanOpenWindowsAutomatically: [true],
                setSupportMultipleWindows: [false]
            };
        }
        else {
            webPlayerSettings = {
                javaScriptCanOpenWindowsAutomatically: true
            };
        }
        return this._webPlayerContainer.setSettings(webPlayerSettings, {}).then(() => {
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, true, false, true, false, this._options).catch((e) => {
                this.hide();
            });
        });
    }
    setWebPlayerData(data, mimeType, encoding) {
        return this._webPlayerContainer.setData(data, mimeType, encoding).catch((error) => {
            this._core.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger('webplayer_set_data_error', new DiagnosticError(error, { data: data, mimeType: mimeType, encoding: encoding }));
            this.setFinishState(FinishState.ERROR);
            this.hide();
        });
    }
    getAndroidViewSize(size, density) {
        return size * (density / 160);
    }
    setWebplayerSettings(shouldOverrideUrlLoadingReturnValue) {
        const eventSettings = {
            onPageStarted: {
                sendEvent: true
            },
            shouldOverrideUrlLoading: {
                sendEvent: true,
                returnValue: shouldOverrideUrlLoadingReturnValue,
                callSuper: false
            },
            onReceivedSslError: { shouldCallSuper: true }
        };
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }
    setWebPlayerContent() {
        return this.setWebplayerSettings(true).then(() => {
            const markup = this._campaign.getDynamicMarkup();
            return this.setWebPlayerData(markup, 'text/html', 'UTF-8').then(() => {
                this._contentReady = true;
            });
        });
    }
    getOperativeEventParams() {
        return {
            placement: this._placement
        };
    }
    setupPrivacyObservers() {
        if (this._view.onPrivacyClosed) {
            this._view.onPrivacyClosed.subscribe(() => {
                this._privacyShowing = false;
                Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
                    this.setWebViewViewFrame(width, height, false);
                });
            });
        }
        if (this._view.onPrivacyOpened) {
            this._view.onPrivacyOpened.subscribe(() => {
                this._privacyShowing = true;
                Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
                    this.setWebViewViewFrame(width, height, true);
                });
            });
        }
    }
    sendTrackingEvent(event) {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'display', this._campaign.getUseWebViewUserAgentForTracking());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEFkVW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9EaXNwbGF5L0FkVW5pdHMvRGlzcGxheUludGVyc3RpdGlhbEFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBRy9FLE9BQU8sRUFBMEIsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFHNUYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSTlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFTekMsTUFBTSxPQUFPLHlCQUEwQixTQUFRLGNBQWM7SUF1QnpELFlBQVksVUFBZ0Q7UUFDeEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBZGQseUJBQW9CLEdBQVksS0FBSyxDQUFDO1FBQ3RDLDJCQUFzQixHQUFZLEtBQUssQ0FBQztRQUN4QyxzQ0FBaUMsR0FBWSxLQUFLLENBQUM7UUFDbkQsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFNL0Isb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFFZiw2QkFBd0IsR0FBRyxFQUFFLENBQUM7UUFJM0MsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQztRQUMvRCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDO1FBQ2pFLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElB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