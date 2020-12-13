import { Platform } from 'Core/Constants/Platform';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { Url } from 'Core/Utilities/Url';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, ErrorMetric } from 'Ads/Utilities/SDKMetrics';
export class VastEndScreenEventHandler {
    constructor(adUnit, parameters) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._vastCampaign = parameters.campaign;
        this._vastEndScreen = this._vastAdUnit.getEndScreen();
        this._gameSessionId = parameters.gameSessionId;
        this._abGroup = parameters.coreConfig.getAbGroup();
        this._ads = parameters.ads;
        this._placement = parameters.placement;
    }
    onVastEndScreenClick() {
        this.setCallButtonEnabled(false);
        this._ads.Listener.sendClickEvent(this._placement.getId());
        if (!this._vastAdUnit.hasImpressionOccurred()) {
            SDKMetrics.reportMetricEvent(ErrorMetric.VastClickWithoutImpressionError);
        }
        const clickThroughURL = this.getClickThroughURL();
        if (clickThroughURL) {
            const useWebViewUserAgentForTracking = this._vastCampaign.getUseWebViewUserAgentForTracking();
            const ctaClickedTime = Date.now();
            const redirectBreakers = Url.getAppStoreUrlTemplates(this._platform);
            return this._request.followRedirectChain(clickThroughURL, useWebViewUserAgentForTracking, redirectBreakers).catch(() => {
                return clickThroughURL;
            }).then((storeUrl) => {
                return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, clickThroughURL);
            });
        }
        return Promise.reject(new Error('There is no clickthrough URL for video or companion'));
    }
    getClickThroughURL() {
        return this._vastAdUnit.getCompanionClickThroughUrl() || this._vastAdUnit.getVideoClickThroughURL();
    }
    onVastEndScreenClose() {
        this._vastAdUnit.hide();
    }
    onKeyEvent(keyCode) {
        if (keyCode === 4 /* BACK */ && this._vastAdUnit.isShowing() && !this._vastAdUnit.canShowVideo()) {
            this._vastAdUnit.hide();
        }
    }
    onVastEndScreenShow() {
        this._vastAdUnit.sendCompanionTrackingEvent(this._vastCampaign.getSession().getId());
    }
    openUrlOnCallButton(url, clickDuration, clickUrl) {
        return this.onOpenUrl(url).then(() => {
            this.setCallButtonEnabled(true);
            this._vastAdUnit.sendCompanionClickTrackingEvent(this._vastCampaign.getSession().getId());
            this._vastAdUnit.sendTrackingEvent(TrackingEvent.VIDEO_ENDCARD_CLICK);
            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'vast_endscreen', this._vastCampaign, this._abGroup.valueOf(), this._gameSessionId);
        }).catch(() => {
            this.setCallButtonEnabled(true);
        });
    }
    onOpenUrl(url) {
        if (this._platform === Platform.IOS) {
            return this._core.iOS.UrlScheme.open(url);
        }
        else {
            return this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
    setCallButtonEnabled(enabled) {
        if (this._vastEndScreen) {
            this._vastEndScreen.setCallButtonEnabled(enabled);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEVuZFNjcmVlbkV2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL0V2ZW50SGFuZGxlcnMvVmFzdEVuZFNjcmVlbkV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFPbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDbEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSW5FLE1BQU0sT0FBTyx5QkFBeUI7SUFZbEMsWUFBWSxNQUFrQixFQUFFLFVBQTJDO1FBQ3ZFLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDM0IsSUFBSSxDQUFD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