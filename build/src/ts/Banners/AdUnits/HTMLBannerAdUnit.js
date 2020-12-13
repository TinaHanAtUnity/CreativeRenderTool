import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { Promises } from 'Core/Utilities/Promises';
import { SDKMetrics, BannerMetric } from 'Ads/Utilities/SDKMetrics';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
export class HTMLBannerAdUnit {
    constructor(parameters) {
        this._clickEventsSent = false;
        this._impressionEventsSent = false;
        this._leaveApplicationEventTriggered = false;
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._campaign = parameters.campaign;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._webPlayerContainer = parameters.webPlayerContainer;
        this._bannerNativeApi = parameters.bannerNativeApi;
        this._placementId = parameters.placementId;
        this._bannerAdViewId = parameters.bannerAdViewId;
    }
    onLoad() {
        return this.setUpBannerPlayer()
            .then(() => {
            return this.getMarkup().then((markup) => {
                const container = this._template.render({
                    markup
                });
                return new Promise((resolve) => {
                    const observer = this._webPlayerContainer.onPageFinished.subscribe(() => {
                        this._webPlayerContainer.onPageFinished.unsubscribe(observer);
                        this.onDomContentLoaded().then(resolve);
                    });
                    this._webPlayerContainer.setData(container, 'text/html', 'UTF-8');
                });
            });
        });
    }
    onDestroy() {
        return Promise.resolve();
    }
    onShow() {
        GameSessionCounters.addStart(this._campaign);
        GameSessionCounters.addView(this._campaign);
        if (!this._impressionEventsSent) {
            SDKMetrics.reportMetricEvent(BannerMetric.BannerAdImpression);
            this.sendTrackingEvent(TrackingEvent.IMPRESSION);
            this._impressionEventsSent = true;
        }
        return Promise.resolve();
    }
    onHide() {
        return Promise.resolve();
    }
    setEventSettings(eventSettings) {
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }
    onOpenURL(url) {
        if (url && url.indexOf('about:blank') === -1) {
            if (!this._clickEventsSent) {
                this._clickEventsSent = true;
                this.sendTrackingEvent(TrackingEvent.CLICK);
                this._bannerNativeApi.BannerListenerApi.sendClickEvent(this._bannerAdViewId);
            }
            if (this._platform === Platform.IOS) {
                this._core.iOS.UrlScheme.open(url).then(() => {
                    if (!this._leaveApplicationEventTriggered) {
                        this._leaveApplicationEventTriggered = true;
                        this._bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent(this._bannerAdViewId);
                    }
                });
            }
            else if (this._platform === Platform.ANDROID) {
                this._core.Android.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': url
                }).then(() => {
                    if (!this._leaveApplicationEventTriggered) {
                        this._leaveApplicationEventTriggered = true;
                        this._bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent(this._bannerAdViewId);
                    }
                });
            }
        }
    }
    sendTrackingEvent(event) {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'banner', this._campaign.getUseWebViewUserAgentForTracking());
    }
    setUpBannerPlayer() {
        return Promises.voidResult(Promise.all([
            this.setUpBannerPlayerSettings(),
            this.setUpBannerPlayerEvents()
        ]));
    }
    setUpBannerPlayerEvents() {
        let eventSettings;
        if (this._platform === Platform.ANDROID) {
            eventSettings = {
                onPageFinished: {
                    sendEvent: true
                },
                onReceivedSslError: { shouldCallSuper: true }
            };
        }
        else {
            eventSettings = {
                onPageFinished: {
                    sendEvent: true
                },
                onReceivedSslError: { shouldCallSuper: true }
            };
        }
        return this.setEventSettings(eventSettings);
    }
    setUpBannerPlayerSettings() {
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
                javaScriptCanOpenWindowsAutomatically: true,
                scalesPagesToFit: true
            };
        }
        return this._webPlayerContainer.setSettings(webPlayerSettings, {});
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFRNTEJhbm5lckFkVW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9CYW5uZXJzL0FkVW5pdHMvSFRNTEJhbm5lckFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSTVGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVwRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQWF4RSxNQUFNLE9BQWdCLGdCQUFnQjtJQWVsQyxZQUFZLFVBQW1DO1FBSnZDLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUN6QiwwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFDOUIsb0NBQStCLEdBQUcsS0FBSyxDQUFDO1FBRzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUM7UUFDakUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQztRQUN6RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7UUFDM0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDO0lBQ3JELENBQUM7SUFFTSxN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