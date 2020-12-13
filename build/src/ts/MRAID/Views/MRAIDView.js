import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DOMUtils } from 'Core/Utilities/DOMUtils';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { View } from 'Core/Views/View';
import { MRAIDAdapterContainer } from 'MRAID/EventBridge/MRAIDAdapterContainer';
import JsConsoleDebugScript from 'html/DebugJsConsole.html';
import DeviceOrientationScript from 'html/mraid/deviceorientation-support.html';
export class MRAIDView extends View {
    constructor(platform, core, deviceInfo, id, placement, campaign, privacy, showGDPRBanner, abGroup, hidePrivacy, gameSessionId) {
        super(platform, id);
        this._showGDPRBanner = false;
        this._gdprPopupClicked = false;
        this._callButtonEnabled = true;
        this._isLoaded = false;
        this._canClose = false;
        this._canSkip = false;
        this._didReward = false;
        this._CLOSE_LENGTH = 30;
        this._backgroundTime = 0;
        this._core = core;
        this._placement = placement;
        this._deviceInfo = deviceInfo;
        this._campaign = campaign;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;
        this._hidePrivacyButton = hidePrivacy;
        this._abGroup = abGroup;
        this._privacyPanelOpen = false;
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.close-region'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
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
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];
        this._gameSessionId = gameSessionId || 0;
        this._mraidAdapterContainer = new MRAIDAdapterContainer(this);
    }
    static setDebugJsConsole(debug) {
        MRAIDView.DebugJsConsole = debug;
    }
    render() {
        super.render();
        this._closeElement = this._container.querySelector('.close-region');
        this._gdprBanner = this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = this._container.querySelector('.privacy-button');
        this.choosePrivacyShown();
    }
    hide() {
        this.setViewableState(false);
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }
        super.hide();
        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            const container = this._privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
        if (this._stats !== undefined) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(this._stats.averageFps, this._stats.averagePlayFps, 0, 'playable_performance_stats', this._stats));
        }
        if (this._deviceorientationListener) {
            window.removeEventListener('deviceorientation', this._deviceorientationListener, false);
            this._deviceorientationListener = undefined;
        }
    }
    createMRAID(container) {
        const fetchingTimestamp = Date.now();
        let fetchingStopTimestamp = Date.now();
        let mraidParseTimestamp = Date.now();
        return this.fetchMRAID().then(mraid => {
            fetchingStopTimestamp = mraidParseTimestamp = Date.now();
            if (mraid) {
                const markup = this._campaign.getDynamicMarkup();
                if (markup) {
                    mraid = mraid.replace('{UNITY_DYNAMIC_MARKUP}', markup);
                }
                if (MRAIDView.DebugJsConsole) {
                    container = container.replace('<script id=\"debug-js-console\"></script>', JsConsoleDebugScript);
                }
                container = container.replace('<script id=\"deviceorientation-support\"></script>', DeviceOrientationScript);
                mraid = mraid.replace(/\$/g, '$$$');
                mraid = this.replaceMraidSources(mraid);
                return container.replace('<body></body>', '<body>' + mraid + '</body>');
            }
            throw new WebViewError('Unable to fetch MRAID');
        }).then((data) => {
            const fetchingDuration = (fetchingStopTimestamp - fetchingTimestamp) / 1000;
            const mraidParseDuration = (Date.now() - mraidParseTimestamp) / 1000;
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(fetchingDuration, mraidParseDuration, 0, 'playable_fetching_time', {}));
            return data;
        });
    }
    isKPIDataValid(values, kpi) {
        let valid = true;
        Object.keys(values).forEach((key) => {
            const time = values[key];
            if (typeof time !== 'number' || isNaN(time) || time < 0 || time > 3600) {
                valid = false;
            }
        });
        if (!valid && this._gameSessionId % 1000 === 999) {
            Diagnostics.trigger('playable_kpi_time_value_error', Object.assign({ message: 'Time value for KPI looks unreasonable', kpi }, values));
        }
        return valid;
    }
    setCallButtonEnabled(value) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }
    isLoaded() {
        return this._isLoaded;
    }
    choosePrivacyShown() {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
        }
        else {
            this._privacyButton.style.visibility = 'visible';
            this._gdprBanner.style.pointerEvents = '1';
            this._gdprBanner.style.visibility = 'hidden';
        }
        // hide privacy for China
        if (this._hidePrivacyButton) {
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
            return;
        }
    }
    updateStats(stats) {
        this._stats = Object.assign({}, stats, { averageFps: stats.frameCount / stats.totalTime, averagePlayFps: stats.frameCount / stats.playTime });
    }
    prepareProgressCircle() {
        if (this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = this._CLOSE_LENGTH;
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
            this._closeRemaining = this._CLOSE_LENGTH;
            this._updateInterval = window.setInterval(() => {
                const progress = (this._CLOSE_LENGTH - this._closeRemaining) / this._CLOSE_LENGTH;
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
    updateProgressCircle(container, value) {
        const wrapperElement = container.querySelector('.progress-wrapper');
        if (this._platform === Platform.ANDROID && this._deviceInfo.getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }
        const leftCircleElement = container.querySelector('.circle-left');
        const rightCircleElement = container.querySelector('.circle-right');
        const degrees = value * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';
        if (value >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }
    setAnalyticsBackgroundTime(viewable) {
        if (!viewable) {
            this._backgroundTimestamp = Date.now();
        }
        else {
            if (this._backgroundTimestamp) {
                this._backgroundTime += Date.now() - this._backgroundTimestamp;
            }
        }
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
            this._core.Sdk.logWarning(`Could not parse markup for campaign ${this._campaign.getId()}`);
            return mraid;
        }
        const src = dom.documentElement.querySelector('script[src^="mraid.js"]');
        if (src && src.parentNode) {
            src.parentNode.removeChild(src);
        }
        return dom.documentElement.outerHTML;
    }
    fetchMRAID() {
        const resourceUrl = this._campaign.getResourceUrl();
        if (resourceUrl) {
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
        return Promise.resolve(this._campaign.getResource());
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
            this._privacyPanelOpen = false;
        }
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this._privacy.show();
        this._privacyPanelOpen = true;
    }
    onGDPRPopupEvent(event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        this._privacy.show();
        this._privacyPanelOpen = true;
    }
    loadWebPlayer(webPlayerContainer) {
        return Promise.resolve();
    }
    onSetOrientationProperties(allowOrientationChange, orientation) {
        this._handlers.forEach(handler => handler.onMraidOrientationProperties({
            allowOrientationChange: allowOrientationChange,
            forceOrientation: orientation
        }));
    }
    onOpen(url) {
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }
    onLoadedEvent() {
        // do nothing by default except for MRAID
    }
    onAREvent(msg) {
        return Promise.resolve();
    }
    onBridgeSetOrientationProperties(allowOrientationChange, forceOrientation) {
        this.onSetOrientationProperties(allowOrientationChange, forceOrientation);
    }
    onBridgeOpen(url) {
        this.onOpen(encodeURI(url));
    }
    onBridgeLoad() {
        this.onLoadedEvent();
    }
    onBridgeAnalyticsEvent(event, eventData) {
        this.sendMraidAnalyticsEvent(event, eventData);
    }
    onBridgeClose() {
        this._handlers.forEach(handler => handler.onMraidClose());
    }
    onBridgeStateChange(customState) {
        if (customState === 'completed') {
            if (!this._placement.allowSkip() && this._closeRemaining > 5) {
                this._closeRemaining = 5;
            }
        }
    }
    onBridgeResizeWebview() {
        // This will be used to handle rotation changes for webplayer-based mraid
    }
    onBridgeSendStats(totalTime, playTime, frameCount) {
        this.updateStats({
            totalTime: totalTime,
            playTime: playTime,
            frameCount: frameCount
        });
    }
    onBridgeAREvent(msg) {
        this.onAREvent(msg).catch((reason) => this._core.Sdk.logError('AR message error: ' + reason.toString()));
    }
    onBridgeArReadyToShow(msg) {
        this.onArReadyToShowEvent(msg).catch((reason) => this._core.Sdk.logError('AR ready to show message error: ' + reason.toString()));
    }
    onBridgeArButtonHide(msg) {
        this.onArButtonHideEvent(msg).catch((reason) => this._core.Sdk.logError('AR button hide message error: ' + reason.toString()));
    }
    onArReadyToShowEvent(msg) {
        return Promise.resolve();
    }
    onArButtonHideEvent(msg) {
        return Promise.resolve();
    }
    handleDeviceOrientation(event) {
        this._mraidAdapterContainer.sendDeviceOrientationEvent(event);
    }
    onBridgeDeviceOrientationSubscribe() {
        // Defer subscribing to deviceorientation event here to only subscribe to the event when the creative needs the data
        if (!this._deviceorientationListener) {
            this._deviceorientationListener = (orientationEvent) => this.handleDeviceOrientation(orientationEvent);
            window.addEventListener('deviceorientation', this._deviceorientationListener, false);
        }
    }
    onUseCustomClose(hideClose) {
        return;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURWaWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01SQUlEL1ZpZXdzL01SQUlEVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBR3hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUl2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUdoRixPQUFPLG9CQUFvQixNQUFNLDBCQUEwQixDQUFDO0FBQzVELE9BQU8sdUJBQXVCLE1BQU0sMkNBQTJDLENBQUM7QUFnQ2hGLE1BQU0sT0FBZ0IsU0FBdUMsU0FBUSxJQUFPO0lBa0R4RSxZQUFZLFFBQWtCLEVBQUUsSUFBYyxFQUFFLFVBQXNCLEVBQUUsRUFBVSxFQUFFLFNBQW9CLEVBQUUsUUFBdUIsRUFBRSxPQUF3QixFQUFFLGNBQXVCLEVBQUUsT0FBZ0IsRUFBRSxXQUFvQixFQUFFLGFBQXNCO1FBQ2hQLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUE1Q2Qsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBTzFCLHVCQUFrQixHQUFZLElBQUksQ0FBQztRQUVuQyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBS2xCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUdqQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBR25C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