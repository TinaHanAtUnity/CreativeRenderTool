import { Template } from 'Core/Utilities/Template';
import VastEndcardOverlayTemplate from 'html/VastHTMLEndScreen.html';
import VastEndcardHTMLTemplate from 'html/VastEndcardHTMLContent.html';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { Platform } from 'Core/Constants/Platform';
import { SDKMetrics, VastMetric } from 'Ads/Utilities/SDKMetrics';
export class VastHTMLEndScreen extends VastEndScreen {
    constructor(parameters, webPlayerContainer) {
        super(parameters);
        this._htmlContentTemplateData = {};
        this._privacy = parameters.privacy;
        this._hidePrivacy = parameters.adsConfig.getHidePrivacy() || false;
        this._webPlayerContainer = webPlayerContainer;
        this._adUnitContainer = parameters.container;
        this._deviceInfo = parameters.deviceInfo;
        this._core = parameters.core;
        this._htmlContentTemplateData = {
            'endScreenHtmlContent': (this._campaign.getVast().getHtmlCompanionResourceContent() ? this._campaign.getVast().getHtmlCompanionResourceContent() : undefined)
        };
        this._template = new Template(VastEndcardOverlayTemplate);
        this._htmlContentTemplate = new Template(VastEndcardHTMLTemplate);
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.btn-close-html-endcard'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.privacy-button-html-endcard'
            }
        ];
        this._privacy.addEventHandler(this);
        this._controlBarHeight = 100;
    }
    show() {
        if (this._htmlContentTemplateData) {
            super.show();
            return this.setUpWebPlayers().then(() => {
                return this._webPlayerContainer.setData(this._htmlContentTemplate.render(this._htmlContentTemplateData), 'text/html', 'UTF-8')
                    .then(() => {
                    SDKMetrics.reportMetricEvent(VastMetric.VastHTMLEndcardShown);
                }).catch(() => {
                    SDKMetrics.reportMetricEvent(VastMetric.VastHTMLEndcardShownFailed);
                    this.onCloseEvent(new Event('click'));
                });
            }).catch(() => {
                this.onCloseEvent(new Event('click'));
                SDKMetrics.reportMetricEvent(VastMetric.VastHTMLEndcardShownFailed);
                return Promise.reject();
            });
        }
        else {
            this.onCloseEvent(new Event('click'));
            SDKMetrics.reportMetricEvent(VastMetric.VastHTMLEndcardShownFailed);
            return Promise.reject();
        }
    }
    remove() {
        super.remove();
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
            delete this._privacy;
        }
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
        this._adUnitContainer.setViewFrame('webview', 0, 0, this._screenWidth, this._controlBarHeight).catch(() => {
            this.onCloseEvent(new Event('click'));
        });
    }
    setUpWebPlayers() {
        if (this._platform === Platform.IOS) {
            this._onCreateWebview = this._webPlayerContainer.onCreateWebView.subscribe((url) => {
                this.shouldOverrideUrlLoading(url, undefined);
            });
        }
        else {
            this._shouldOverrideUrlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url, method) => {
                this.shouldOverrideUrlLoading(url, method);
            });
        }
        return this._adUnitContainer.reconfigure(2 /* WEB_PLAYER */).then(() => {
            this._adUnitContainer.reorient(false, this._adUnitContainer.getLockedOrientation()).then(() => {
                this.setWebPlayerSettings().then(() => {
                    const promises = [
                        this._deviceInfo.getScreenWidth(),
                        this._deviceInfo.getScreenHeight()
                    ];
                    Promise.all(promises).then(([screenWidth, screenHeight]) => {
                        this._screenHeight = screenHeight;
                        this._screenWidth = screenWidth;
                        this._adUnitContainer.setViewFrame('webplayer', 0, 0, screenWidth, screenHeight).then(() => {
                            this._adUnitContainer.setViewFrame('webview', 0, 0, screenWidth, this._controlBarHeight).then(() => {
                                return this.setWebplayerEventSettings();
                            });
                        });
                    });
                });
            });
        });
    }
    shouldOverrideUrlLoading(url, method) {
        if (this._platform === Platform.IOS) {
            this._core.iOS.UrlScheme.open(url);
        }
        else {
            this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
    setWebPlayerSettings() {
        let webPlayerSettings;
        if (this._platform === Platform.ANDROID) {
            webPlayerSettings = {
                setJavaScriptCanOpenWindowsAutomatically: [true]
            };
        }
        else {
            webPlayerSettings = {
                javaScriptCanOpenWindowsAutomatically: true,
                scalesPagesToFit: true,
                scrollEnabled: true
            };
        }
        return this._webPlayerContainer.setSettings(webPlayerSettings, {});
    }
    setWebplayerEventSettings() {
        const eventSettings = {
            onCreateWindow: {
                sendEvent: true
            },
            shouldOverrideUrlLoading: {
                sendEvent: true,
                returnValue: true,
                callSuper: false
            }
        };
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }
    onCloseEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClose());
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this._adUnitContainer.setViewFrame('webview', 0, 0, this._screenWidth, this._screenHeight).then(() => {
            this._privacy.show();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEhUTUxFbmRTY3JlZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9WaWV3cy9WYXN0SFRNTEVuZFNjcmVlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTywwQkFBMEIsTUFBTSw2QkFBNkIsQ0FBQztBQUNyRSxPQUFPLHVCQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQU96RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFJbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVsRSxNQUFNLE9BQU8saUJBQWtCLFNBQVEsYUFBYTtJQWdCaEQsWUFBWSxVQUEyQyxFQUFFLGtCQUFzQztRQUMzRixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFaTCw2QkFBd0IsR0FBa0IsRUFBRSxDQUFDO1FBYzFELElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksS0FBSyxDQUFDO1FBQ25FLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztRQUM5QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUM3QyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBRTdCLElBQUksQ0FBQyx3QkFBd0IsR0FBRztZQUM1QixzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFF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