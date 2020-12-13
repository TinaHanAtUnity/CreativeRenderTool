import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { WKAudiovisualMediaTypes } from 'Ads/Native/WebPlayer';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { Timer } from 'Core/Utilities/Timer';
export class VPAIDAdUnit extends AbstractAdUnit {
    constructor(parameters) {
        super(parameters);
        this._privacyShowing = false;
        this._shouldFullScreenWebView = true;
        this._topWebViewAreaMinHeight = 70;
        this._vpaidCampaign = parameters.campaign;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._options = parameters.options;
        this._view = parameters.vpaid;
        this._closer = parameters.closer;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._clientInfo = parameters.clientInfo;
        this._webPlayerContainer = parameters.webPlayerContainer;
        this._timer = new Timer(() => this.onAdUnitNotLoaded(), VPAIDAdUnit._adLoadTimeout);
        this._endScreen = parameters.endScreen;
        if (this._endScreen) {
            this._endScreen.render();
        }
        if (parameters.platform === Platform.ANDROID) {
            this._topWebViewAreaHeight = Math.floor(this.getAndroidViewSize(this._topWebViewAreaMinHeight, this.getScreenDensity()));
        }
        else {
            this._topWebViewAreaHeight = this._topWebViewAreaMinHeight;
        }
        this._closer.render();
        this._closer.choosePrivacyShown();
    }
    static setAdLoadTimeout(timeout) {
        VPAIDAdUnit._adLoadTimeout = timeout;
    }
    show() {
        this.onShow();
        return this.setupWebPlayer().then(() => {
            this._urlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url, method) => this.onUrlLoad(url));
            this.setupPrivacyObservers();
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, false, false, true, false, this._options).then(() => {
                this.onStart.trigger();
            });
        });
    }
    hide() {
        this.onHide();
        this.hideView();
        return this._container.close();
    }
    description() {
        return 'vpaid';
    }
    openUrl(url) {
        if (url) {
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
    sendTrackingEvent(eventType) {
        const urls = this._vpaidCampaign.getTrackingUrlsForEvent(eventType);
        const sessionId = this._vpaidCampaign.getSession().getId();
        for (const url of urls) {
            this._thirdPartyEventManager.sendWithGet(`vpaid ${eventType}`, sessionId, url);
        }
    }
    sendImpressionTracking() {
        const impressionUrls = this._vpaidCampaign.getImpressionUrls();
        const sessionId = this._vpaidCampaign.getSession().getId();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this._thirdPartyEventManager.sendWithGet('vpaid impression', sessionId, impressionUrl);
            }
        }
    }
    mute() {
        this._view.mute();
    }
    unmute() {
        this._view.unmute();
    }
    onAdLoaded() {
        this._timer.stop();
        this._view.showAd();
    }
    onContainerShow() {
        this.setShowing(true);
        this.onContainerForeground();
    }
    onContainerDestroy() {
        // EMPTY
    }
    onContainerBackground() {
        this._view.pauseAd();
        if (this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.hide();
        }
    }
    onContainerForeground() {
        this.showCloser();
        if (this._view.isLoaded() && !this._privacyShowing) {
            this._view.resumeAd();
        }
        else if (!this._view.isLoaded()) {
            this._view.loadWebPlayer();
        }
        else {
            // Popup will resume video
        }
    }
    onContainerSystemMessage(message) {
        // EMPTY
    }
    setWebViewSize(shouldFullScreen) {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
            if (shouldFullScreen) {
                return this._container.setViewFrame('webview', 0, 0, width, height);
            }
            else {
                return this._container.setViewFrame('webview', 0, 0, width, this._topWebViewAreaHeight);
            }
        });
    }
    setupPrivacyObservers() {
        if (this._closer.onPrivacyClosed) {
            this._closer.onPrivacyClosed.subscribe(() => {
                this.setWebViewSize(!this._shouldFullScreenWebView);
                this._view.resumeAd();
                this._privacyShowing = false;
            });
        }
        if (this._closer.onPrivacyOpened) {
            this._closer.onPrivacyOpened.subscribe(() => {
                this.setWebViewSize(this._shouldFullScreenWebView);
                this._view.pauseAd();
                this._privacyShowing = true;
            });
        }
    }
    setupWebPlayer() {
        if (this._platform === Platform.ANDROID) {
            return this.setupAndroidWebPlayer();
        }
        else {
            return this.setupIosWebPlayer();
        }
    }
    setupAndroidWebPlayer() {
        const promises = [];
        promises.push(this._webPlayerContainer.setSettings({
            setSupportMultipleWindows: [false],
            setJavaScriptCanOpenWindowsAutomatically: [true],
            setMediaPlaybackRequiresUserGesture: [false]
        }, {}));
        const eventSettings = {
            onPageStarted: {
                sendEvent: true
            },
            shouldOverrideUrlLoading: {
                sendEvent: true,
                returnValue: true
            },
            onReceivedSslError: { shouldCallSuper: true }
        };
        promises.push(this._webPlayerContainer.setEventSettings(eventSettings));
        return Promise.all(promises);
    }
    setupIosWebPlayer() {
        const settings = {
            allowsPlayback: true,
            playbackRequiresAction: false,
            typesRequiringAction: WKAudiovisualMediaTypes.NONE
        };
        const events = {
            onPageStarted: {
                sendEvent: true
            },
            shouldOverrideUrlLoading: {
                sendEvent: true, returnValue: true
            },
            onReceivedSslError: { shouldCallSuper: true }
        };
        return Promise.all([
            this._webPlayerContainer.setSettings(settings, {}),
            this._webPlayerContainer.setEventSettings(events)
        ]);
    }
    onAdUnitNotLoaded() {
        this.setFinishState(FinishState.ERROR);
        SessionDiagnostics.trigger('vpaid_load_timeout', new DiagnosticError(new Error('VPAID failed to load within timeout'), {
            id: this._vpaidCampaign.getId()
        }), this._vpaidCampaign.getSession());
        this.hide();
    }
    onShow() {
        this._timer.start();
        this.setShowing(true);
        this._container.addEventHandler(this);
    }
    onHide() {
        if (this._closer.container().parentElement) {
            this._closer.container().parentElement.removeChild(this._closer.container());
        }
        this._timer.stop();
        this.setShowing(false);
        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._urlLoadingObserver);
        this._container.removeEventHandler(this);
    }
    hideView() {
        this._view.mute();
        this._view.hide();
        this._closer.hide();
        if (this._endScreen) {
            this._endScreen.remove();
        }
    }
    showCloser() {
        // When users background we dont want the endscreen to move to top of frame
        if (document.body.querySelector('#end-screen')) {
            return this.setWebViewSize(this._shouldFullScreenWebView);
        }
        else {
            return this.setWebViewSize(!this._shouldFullScreenWebView).then(() => {
                if (!this._closer.container().parentNode) {
                    document.body.appendChild(this._closer.container());
                }
            });
        }
    }
    getAndroidViewSize(size, density) {
        return size * (density / 160);
    }
    getScreenDensity() {
        if (this._platform === Platform.ANDROID) {
            return this._deviceInfo.getScreenDensity();
        }
        return 0;
    }
    onUrlLoad(url) {
        if (url.indexOf('file://') !== 0 && url.indexOf('about:blank') !== 0) {
            this.openUrl(url);
        }
    }
}
VPAIDAdUnit._adLoadTimeout = 7000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvQWRVbml0cy9WUEFJREFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBSS9FLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUd0RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUs5RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFZN0MsTUFBTSxPQUFPLFdBQVksU0FBUSxjQUFjO0lBd0IzQyxZQUFZLFVBQWtDO1FBQzFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQVJkLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBR3hCLDZCQUF3QixHQUFHLElBQUksQ0FBQztRQUV2Qiw2QkFBd0IsR0FBRyxFQUFFLENBQUM7UUFLM0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQzFDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUM7UUFDakUsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDekMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQztRQUN6RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFFdkMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDNUI7UUFFRCxJQUFJLFVBQVUsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUMxQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1SDthQUFNO1lBQ0gsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztTQUM5RDtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFqRE0sTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQWU7UUFDMUMsV0FBVyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFDekMsQ0FBQztJQWlETSxJQUFJO1FBQ1AsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2QsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNuQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3SCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM3QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDM0ksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLElBQUk7UUFDUCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSxXQUFXO1FBQ2QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLE9BQU8sQ0FBQyxHQUFrQjtRQUM3QixJQUFJLEdBQUcsRUFBRTtZQUNMLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZDO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO29CQUM5QixRQUFRLEVBQUUsNEJBQTRCO29CQUN0QyxLQUFLLEVBQUUsR0FBRztpQkFDYixDQUFDLENBQUM7YUFDTjtTQUNKO0lBQ0wsQ0FBQztJQUVNLGlCQUFpQixDQUFDLFNBQXdCO1FBQzdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUzRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtZQUNwQixJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLFNBQVMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ2xGO0lBQ0wsQ0FBQztJQUVNLHNCQUFzQjtRQUN6QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDL0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzRCxJQUFJLGNBQWMsRUFBRTtZQUNoQixLQUFLLE1BQU0sYUFBYSxJQUFJLGNBQWMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDMUY7U0FDSjtJQUNMLENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU0sTUFBTTtRQUNULElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVNLFVBQVU7UUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVNLGVBQWU7UUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLFFBQVE7SUFDWixDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFckIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksY0FBYyxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtZQUM5RixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFTSxxQkFBcUI7UUFDeEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN6QjthQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDOUI7YUFBTTtZQUNILDBCQUEwQjtTQUM3QjtJQUNMLENBQUM7SUFFTSx3QkFBd0IsQ0FBQyxPQUFxQztRQUNqRSxRQUFRO0lBQ1osQ0FBQztJQUVNLGNBQWMsQ0FBQyxnQkFBeUI7UUFDM0MsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO1lBQ2pILElBQUksZ0JBQWdCLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZFO2lCQUFNO2dCQUNILE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQzNGO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8scUJBQXFCO1FBQ3pCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRTtZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUN4QyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVPLGNBQWM7UUFDbEIsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztTQUN2QzthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUNuQztJQUNMLENBQUM7SUFFTyxxQkFBcUI7UUFDekIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQztZQUMvQyx5QkFBeUIsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNsQyx3Q0FBd0MsRUFBRSxDQUFDLElBQUksQ0FBQztZQUNoRCxtQ0FBbUMsRUFBRSxDQUFDLEtBQUssQ0FBQztTQUMvQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDUixNQUFNLGFBQWEsR0FBRztZQUNsQixhQUFhLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLElBQUk7YUFDbEI7WUFDRCx3QkFBd0IsRUFBRTtnQkFDdEIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsV0FBVyxFQUFFLElBQUk7YUFDcEI7WUFDRCxrQkFBa0IsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUU7U0FDaEQsQ0FBQztRQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDeEUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTyxpQkFBaUI7UUFDckIsTUFBTSxRQUFRLEdBQUc7WUFDYixjQUFjLEVBQUUsSUFBSTtZQUNwQixzQkFBc0IsRUFBRSxLQUFLO1lBQzdCLG9CQUFvQixFQUFFLHVCQUF1QixDQUFDLElBQUk7U0FDckQsQ0FBQztRQUNGLE1BQU0sTUFBTSxHQUFHO1lBQ1gsYUFBYSxFQUFFO2dCQUNYLFNBQVMsRUFBRSxJQUFJO2FBQ2xCO1lBQ0Qsd0JBQXdCLEVBQUU7Z0JBQ3RCLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUk7YUFDckM7WUFDRCxrQkFBa0IsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUU7U0FDaEQsQ0FBQztRQUNGLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1NBQ3BELENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxpQkFBaUI7UUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLElBQUksZUFBZSxDQUFDLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLEVBQUU7WUFDbkgsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO1NBQ2xDLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxNQUFNO1FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRCLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTyxNQUFNO1FBQ1YsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWEsRUFBRTtZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN4RixJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTyxRQUFRO1FBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDNUI7SUFDTCxDQUFDO0lBRU8sVUFBVTtRQUNkLDJFQUEyRTtRQUMzRSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzVDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUM3RDthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFO29CQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7aUJBQ3ZEO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsT0FBZTtRQUNwRCxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3JDLE9BQTRCLElBQUksQ0FBQyxXQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUNwRTtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVPLFNBQVMsQ0FBQyxHQUFXO1FBQ3pCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtJQUNMLENBQUM7O0FBL1JjLDBCQUFjLEdBQVcsSUFBSSxDQUFDIn0=