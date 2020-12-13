import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';
import { WebViewError } from 'Core/Errors/WebViewError';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { Platform } from 'Core/Constants/Platform';
import { Localization } from 'Core/Utilities/Localization';
import MRAIDContainer from 'html/mraidEndScreen/MraidEndScreenContainer.html';
import { DOMUtils } from 'Core/Utilities/DOMUtils';
import { ExternalMRAIDEndScreenMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Template } from 'Core/Utilities/Template';
import ExternalMRAIDEndScreenTemplate from 'html/mraidEndScreen/ExternalMRAIDEndScreen.html';
import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { MRAIDEventBridgeForIFrame } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridgeForIFrame';
export class ExternalMRAIDEndScreen extends ExternalEndScreen {
    constructor(parameters, campaign, country) {
        super(undefined, parameters, campaign, country);
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.closeAd(),
                selector: '.close-region'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(),
                selector: '.privacy-button'
            },
            {
                event: 'click',
                listener: (event) => {
                    this.onGDPRPopupEvent(event);
                    this._gdprPopupClicked = true;
                    this.choosePrivacyShown();
                },
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(),
                selector: '.icon-gdpr'
            }
        ];
        this._localization = new Localization(parameters.language, 'endscreen');
        this._template = new Template(ExternalMRAIDEndScreenTemplate, this._localization);
        const endScreenSettings = this._campaign.getEndScreenSettings();
        if (endScreenSettings) {
            this._showCloseButton = endScreenSettings.showCloseButton;
            this._closeButtonDelay = this._closeButtonDelayRemaining = endScreenSettings.closeButtonDelay;
            if (!this._showCloseButton) {
                this._canClose = true;
            }
        }
        else {
            this._showCloseButton = true;
            this._closeButtonDelay = this._closeButtonDelayRemaining = 0;
        }
        window.removeEventListener('message', this._messageListener);
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Initialize);
    }
    initIframe() {
        const initIframeStopwatch = createStopwatch();
        initIframeStopwatch.start();
        this._iframe = this._container.querySelector('#iframe-end-screen');
        this._mraidEventBridge = new MRAIDEventBridgeForIFrame(this, this._core, this._iframe);
        this._closeRegion = this._container.querySelector('.close-region');
        this._gdprBanner = this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = this._container.querySelector('.icon-gdpr');
        this._iframe.onload = () => {
            this._isIframeReady = true;
            initIframeStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.IframeInitialize, {});
        };
        this.createMRAID(MRAIDContainer.replace('{{ CREATIVE_URL }}', this._endScreenUrl)).then((content) => {
            this._iframe.srcdoc = content;
        }).catch((reason) => {
            initIframeStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.MRAIDFailed, { 'rsn': 'create_failed' });
        });
        this._iframe.classList.add('adjust-for-safe-area');
    }
    createMRAID(container) {
        const createMraidStopwatch = createStopwatch();
        const fetchMraidStopwatch = createStopwatch();
        fetchMraidStopwatch.start();
        return this.fetchMRAID().then(mraid => {
            if (mraid) {
                fetchMraidStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.FetchMRAID, {});
                createMraidStopwatch.start();
                mraid = mraid.replace(/\$/g, '$$$');
                mraid = this.replaceMraidSources(mraid);
                return container.replace('<body></body>', '<body>' + mraid + '</body>');
            }
            fetchMraidStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.MRAIDFailed, { 'rsn': 'null_mraid' });
            throw new WebViewError('Unable to fetch MRAID');
        }).then((data) => {
            createMraidStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.CreateMRAID, {});
            return data;
        });
    }
    fetchMRAID() {
        const resourceUrl = this._campaign.getEndScreen();
        if (this._platform === Platform.ANDROID) {
            return XHRequest.get(resourceUrl.getUrl());
        }
        else {
            const fileId = resourceUrl.getFileId();
            if (fileId) {
                return this._core.Cache.getFileContent(fileId, 'UTF-8');
            }
            else {
                return XHRequest.get(resourceUrl.getOriginalUrl());
            }
        }
    }
    prepareProgressCircle() {
        if (!this._showCloseButton) {
            this._closeRegion.style.visibility = 'hidden';
            return;
        }
        this._closeButtonProgressWrapperElement = this._closeRegion.querySelector('.progress-wrapper');
        this._closeButtonCircleBase = this._closeRegion.querySelector('.circle-base');
        this._closeButtonLeftCircleElement = this._closeRegion.querySelector('.circle-left');
        this._closeButtonRightCircleElement = this._closeRegion.querySelector('.circle-right');
        if (this._closeButtonDelay > 0) {
            this._updateInterval = window.setInterval(() => {
                if (this._closeButtonDelayRemaining > 0) {
                    this._closeButtonDelayRemaining--;
                    this.updateProgressCircle(1 - (this._closeButtonDelayRemaining / this._closeButtonDelay));
                }
                if (this._closeButtonDelayRemaining <= 0) {
                    this._closeRegion.style.opacity = '1';
                    this._canClose = true;
                    this.updateProgressCircle(1);
                    clearInterval(this._updateInterval);
                }
            }, 1000);
        }
        else {
            this._canClose = true;
            this._closeRegion.style.opacity = '1';
            this._closeButtonCircleBase.style.visibility = 'hidden';
            this._closeButtonProgressWrapperElement.style.visibility = 'hidden';
        }
    }
    updateProgressCircle(value) {
        const degrees = value * 360;
        this._closeButtonLeftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';
        if (value >= 0.5) {
            this._closeButtonProgressWrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            this._closeButtonRightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }
    show() {
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Show);
        this.prepareProgressCircle();
        this.choosePrivacyShown();
        if (this._container && this._isLoaded) {
            this._container.style.visibility = 'visible';
            this._container.style.display = 'block';
            this._mraidEventBridge.sendViewableEvent(true);
        }
        else {
            SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.ShowNotReady);
            this.onCloseEvent();
        }
    }
    hide() {
        super.hide();
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Hide);
        this._mraidEventBridge.sendViewableEvent(false);
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }
    }
    closeAd() {
        if (this._canClose) {
            SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Close);
            this.onCloseEvent();
        }
    }
    onCloseEvent() {
        this._handlers.forEach(handler => handler.onEndScreenClose());
        this._mraidEventBridge.stop();
    }
    choosePrivacyShown() {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
            SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'shown' });
        }
        else {
            this._privacyButton.style.visibility = 'visible';
            this._gdprBanner.style.pointerEvents = '1';
            this._gdprBanner.style.visibility = 'hidden';
            SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'hidden' });
        }
        // hide privacy for China
        if (this._hidePrivacy) {
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
            SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'hidden_china' });
        }
    }
    onGDPRPopupEvent(event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        this._privacy.show();
        SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'popup' });
    }
    onPrivacyEvent() {
        SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'privacy' });
        super.onPrivacyEvent();
    }
    replaceMraidSources(mraid) {
        // Workaround for https://jira.hq.unity3d.com/browse/ABT-333
        // On certain versions of the webview on iOS (2.0.2 - 2.0.8) there seems
        // to be some sort of race where the parsed document returns a null
        // documentElement which throws an exception.
        let dom;
        if (this._platform === Platform.IOS) {
            dom = DOMUtils.parseFromString(mraid, 'text/html');
        }
        else {
            dom = new DOMParser().parseFromString(mraid, 'text/html');
        }
        if (!dom) {
            SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.MRAIDWarning, { rsn: 'dom_null' });
            return mraid;
        }
        const src = dom.documentElement.querySelector('script[src^="mraid.js"]');
        if (src && src.parentNode) {
            src.parentNode.removeChild(src);
        }
        return dom.documentElement.outerHTML;
    }
    // EventBridge
    onReady() {
        // ready
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.MRAIDEventBridgeReady);
    }
    onClose() {
        // close
        this.closeAd();
    }
    onLoaded() {
        // loaded
        this._isLoaded = true;
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.MRAIDEventBridgeLoaded);
    }
    onOpen(url) {
        // open
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Click);
        this.onDownloadEvent();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZXJuYWxNUkFJREVuZFNjcmVlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9FeHRlcm5hbEVuZFNjcmVlbi9WaWV3cy9FeHRlcm5hbE1SQUlERW5kU2NyZWVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRzlFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRCxPQUFPLGNBQWMsTUFBTSxrREFBa0QsQ0FBQztBQUM5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLDRCQUE0QixFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3BGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLDhCQUE4QixNQUFNLGlEQUFpRCxDQUFDO0FBRTdGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw4REFBOEQsQ0FBQztBQUV6RyxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsaUJBQWlCO0lBcUJ6RCxZQUFZLFVBQWdDLEVBQUUsUUFBNkIsRUFBRSxPQUFlO1FBQ3hGLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2I7Z0JBQ0ksS0FBSyxFQUFFLE9BQU87Z0JBQ2QsUUFBUSxFQUFFLENBQUMsS0FBWSxF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