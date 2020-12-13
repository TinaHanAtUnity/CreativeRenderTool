import { Template } from 'Core/Utilities/Template';
import ExternalEndScreenTemplate from 'html/ExternalEndScreen.html';
import { View } from 'Core/Views/View';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { ExternalEndScreenMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';
import { XHRequest } from 'Core/Utilities/XHRequest';
export var ExternalEndScreenEventType;
(function (ExternalEndScreenEventType) {
    ExternalEndScreenEventType["Close"] = "close";
    ExternalEndScreenEventType["Open"] = "open";
    ExternalEndScreenEventType["GetParameters"] = "getParameters";
    ExternalEndScreenEventType["Metric"] = "metric";
})(ExternalEndScreenEventType || (ExternalEndScreenEventType = {}));
export class ExternalEndScreen extends View {
    constructor(combination, parameters, campaign, country) {
        super(parameters.platform, 'container-iframe-end-screen');
        this._isIframeReady = false;
        this._language = parameters.language;
        this._privacy = parameters.privacy;
        this._adUnitStyle = parameters.adUnitStyle;
        this._showGDPRBanner = parameters.showGDPRBanner;
        this._campaignId = parameters.campaignId;
        this._hidePrivacy = parameters.hidePrivacy || false;
        this._campaign = campaign;
        this._combination = combination;
        this._template = new Template(ExternalEndScreenTemplate);
        this._core = parameters.core;
        this._country = country;
        // Cannot be null undefined. It is a condition to instantiate this class.
        this._endScreenUrl = campaign.getEndScreen().getUrl();
        this._endScreenParameters = this.getParameters();
        //
        // Communication channel
        //
        this._messageListener = event => {
            if (event.data.type === ExternalEndScreenEventType.Open) {
                this.route(event.data.url);
            }
            else if (event.data.type === ExternalEndScreenEventType.GetParameters) {
                // The iframe asked for the parameters, witch means it is loaded.
                this._isIframeReady = true;
                this.sendParameters();
            }
            else if (event.data.type === ExternalEndScreenEventType.Close) {
                this.onCloseEvent();
            }
            else if (event.data.type === ExternalEndScreenEventType.Metric) {
                SDKMetrics.reportMetricEventWithTags(event.data.metric, Object.assign({}, event.data.tags));
            }
        };
        window.addEventListener('message', this._messageListener);
        //
        // Privacy module
        //
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }
    //
    // View
    //
    render() {
        super.render();
        this.initIframe();
    }
    show() {
        super.show();
        const displayContainer = () => {
            if (this._container) {
                this._container.style.display = 'block';
            }
        };
        if (this._isIframeReady) {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.ShowIframe);
            displayContainer();
        }
        else {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.NotReadyInTime);
            this.onCloseEvent();
        }
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.AutoCloseInvoked);
                this.onCloseEvent();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }
    hide() {
        super.hide();
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
        if (this._privacy) {
            this._privacy.hide();
        }
        if (this._container) {
            this._container.style.display = 'none';
        }
    }
    //
    // External End Screen
    //
    initIframe() {
        SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.StartInitIframe);
        const iframe = this._iframe = this._container.querySelector('#iframe-end-screen');
        iframe.src = this._endScreenUrl;
    }
    onDownloadEvent() {
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            appDownloadUrl: this._campaign.getAppDownloadUrl(),
            adUnitStyle: this._adUnitStyle
        }));
    }
    route(url) {
        const protocol = 'sdk://';
        if (url.startsWith(protocol)) {
            if (url === protocol + 'privacy') {
                this.onPrivacyEvent();
            }
            else if (url === protocol + 'download') {
                this.onDownloadEvent();
            }
        }
        else {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.DefaultRouteUsed);
        }
    }
    onCloseEvent() {
        window.removeEventListener('message', this._messageListener);
        this._handlers.forEach(handler => handler.onEndScreenClose());
    }
    // The iframe cannot load images from cache url.
    // Cache API is only available with 2.1.0 and works only on ios for this purpose.
    getImage(image) {
        const originalUrl = image.getOriginalUrl();
        if (!image.isCached()) {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.UseOriginalUrl);
            return Promise.resolve(originalUrl);
        }
        // After 2.1.0
        const imageExt = originalUrl.split('.').pop();
        const dataUrl = (rawData) => `data:image/${imageExt};base64,${rawData}`;
        if (this._platform === Platform.ANDROID) {
            return XHRequest.getDataUrl(image.getUrl()).catch(() => {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.UnableToGetDataUrl);
                return originalUrl;
            });
        }
        else {
            const fileId = image.getFileId();
            if (fileId) {
                return this._core.Cache.getFileContent(fileId, 'Base64').then(dataUrl);
            }
            else {
                return XHRequest.getDataUrl(image.getOriginalUrl()).catch(() => {
                    SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.UnableToGetDataUrl);
                    return originalUrl;
                });
            }
        }
    }
    getParameters() {
        const getImage = (image) => image
            ? this.getImage(image)
            : Promise.resolve(undefined);
        return Promise.all([
            getImage(this._campaign.getGameIcon()),
            getImage(this._campaign.getLandscape()),
            getImage(this._campaign.getPortrait()),
            getImage(this._campaign.getSquare())
        ]).then(([gameIcon, landscape, portrait, square]) => {
            if (!gameIcon) {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.GameIconImageMissing);
            }
            // If square is not provided, landscape and portrait should be both provided
            if (!square && (!landscape || !portrait)) {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.ImageMissing);
            }
            return {
                'gameIcon': gameIcon,
                'squareImage': square,
                'landscapeImage': landscape,
                'portraitImage': portrait,
                'combination': this._combination,
                'hidePrivacy': this._hidePrivacy,
                'language': this._language,
                'country': this._country,
                'showGdpr': this._showGDPRBanner,
                'gameName': this._campaign.getGameName(),
                'rating': this._campaign.getRating(),
                'ratingCount': this._campaign.getRatingCount()
            };
        });
    }
    sendParameters() {
        this._endScreenParameters.then(parameters => {
            if (this._iframe.contentWindow) {
                this._iframe.contentWindow.postMessage({
                    type: 'parameters',
                    parameters: JSON.stringify(parameters)
                }, '*');
            }
        });
    }
    //
    // Privacy
    //
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
    }
    onPrivacyEvent() {
        if (this._showGDPRBanner) {
            this._gdprPopupClicked = true;
        }
        this._privacy.show();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZXJuYWxFbmRTY3JlZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvRXh0ZXJuYWxFbmRTY3JlZW4vVmlld3MvRXh0ZXJuYWxFbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8seUJBQXlCLE1BQU0sNkJBQTZCLENBQUM7QUFHcEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBR3ZDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDL0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVyRCxNQUFNLENBQU4sSUFBWSwwQkFLWDtBQUxELFdBQVksMEJBQTBCO0lBQ2xDLDZDQUFlLENBQUE7SUFDZiwyQ0FBYSxDQUFBO0lBQ2IsNkRBQStCLENBQUE7SUFDL0IsK0NBQWlCLENBQUE7QUFDckIsQ0FBQyxFQUxXLDBCQUEwQixLQUExQiwwQkFBMEIsUUFLckM7QUFpQkQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLElBQXVCO0lBa0IxRCxZQUFZLFdBQWdELEVBQUUsVUFBZ0MsRUFBRSxRQUE2QixFQUFFLE9BQWU7UUFDMUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUxwRCxtQkFBYyxHQUFHLEtBQUssQ0FBQztRQU83QixJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdB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