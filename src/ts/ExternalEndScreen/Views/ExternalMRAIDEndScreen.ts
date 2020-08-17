import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { WebViewError } from 'Core/Errors/WebViewError';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { Platform } from 'Core/Constants/Platform';
import { Localization } from 'Core/Utilities/Localization';
import MRAIDContainer from 'html/mraidEndScreen/MraidEndScreenContainer.html';
import { DOMUtils } from 'Core/Utilities/DOMUtils';
import { ExternalMRAIDEndScreenMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Template } from 'Core/Utilities/Template';
import ExternalMRAIDEndScreenTemplate from 'html/mraidEndScreen/ExternalMRAIDEndScreen.html';
import { IMRAIDEventBridgeHandler } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';
import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { MRAIDEventBridgeForIFrame } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridgeForIFrame';

export class ExternalMRAIDEndScreen extends ExternalEndScreen implements IMRAIDEventBridgeHandler {
    protected _isLoaded: boolean;
    private _localization: Localization;

    private _closeRegion: HTMLElement;
    private _showCloseButton: boolean;
    private _closeButtonDelay: number;
    private _closeButtonDelayRemaining: number;
    private _updateInterval?: number;
    private _canClose: boolean;

    private _closeButtonProgressWrapperElement: HTMLElement;
    private _closeButtonCircleBase: HTMLElement;
    private _closeButtonLeftCircleElement: HTMLElement;
    private _closeButtonRightCircleElement: HTMLElement;

    private _gdprBanner: HTMLElement;
    private _privacyButton: HTMLElement;

    private _mraidEventBridge: MRAIDEventBridgeForIFrame;

    constructor(parameters: IEndScreenParameters, campaign: PerformanceCampaign, country: string) {
        super(undefined, parameters, campaign, country);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.closeAd(),
                selector: '.close-region'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(),
                selector: '.privacy-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.onGDPRPopupEvent(event);
                    this._gdprPopupClicked = true;
                    this.choosePrivacyShown();
                },
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(),
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
        } else {
            this._showCloseButton = true;
            this._closeButtonDelay = this._closeButtonDelayRemaining = 0;
        }

        window.removeEventListener('message', this._messageListener);

        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Initialize);
    }

    protected initIframe(): void {
        const initIframeStopwatch = createStopwatch();
        initIframeStopwatch.start();

        this._iframe = <HTMLIFrameElement> this._container.querySelector('#iframe-end-screen');
        this._mraidEventBridge = new MRAIDEventBridgeForIFrame(this, this._core, this._iframe);

        this._closeRegion = <HTMLElement> this._container.querySelector('.close-region');
        this._gdprBanner = <HTMLElement> this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement> this._container.querySelector('.icon-gdpr');

        this._iframe.onload = () => {
            this._isIframeReady = true;

            initIframeStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.IframeInitialize, {});
        };

        this.createMRAID(MRAIDContainer.replace('{{ CREATIVE_URL }}', this._endScreenUrl)).then((content) => {
            this._iframe.srcdoc = content;
        }).catch((reason: string) => {
            initIframeStopwatch.stopAndSend(ExternalMRAIDEndScreenMetric.MRAIDFailed, { 'rsn': 'create_failed' });
        });

        this._iframe.classList.add('adjust-for-safe-area');
    }

    public createMRAID(container: string): Promise<string> {
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

    private fetchMRAID(): Promise<string | undefined> {
        const resourceUrl = this._campaign.getEndScreen()!;
        if (this._platform === Platform.ANDROID) {
            return XHRequest.get(resourceUrl.getUrl());
        } else {
            const fileId = resourceUrl.getFileId();
            if (fileId) {
                return this._core.Cache.getFileContent(fileId, 'UTF-8');
            } else {
                return XHRequest.get(resourceUrl.getOriginalUrl());
            }
        }
    }

    private prepareProgressCircle() {
        if (!this._showCloseButton) {
            this._closeRegion.style.visibility = 'hidden';
            return;
        }

        this._closeButtonProgressWrapperElement = <HTMLElement> this._closeRegion.querySelector('.progress-wrapper');
        this._closeButtonCircleBase = <HTMLElement> this._closeRegion.querySelector('.circle-base');
        this._closeButtonLeftCircleElement = <HTMLElement> this._closeRegion.querySelector('.circle-left');
        this._closeButtonRightCircleElement = <HTMLElement> this._closeRegion.querySelector('.circle-right');

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
        } else {
            this._canClose = true;
            this._closeRegion.style.opacity = '1';
            this._closeButtonCircleBase.style.visibility = 'hidden';
            this._closeButtonProgressWrapperElement.style.visibility = 'hidden';
        }
    }

    protected updateProgressCircle(value: number) {
        const degrees = value * 360;
        this._closeButtonLeftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if (value >= 0.5) {
            this._closeButtonProgressWrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            this._closeButtonRightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    public show(): void {
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Show);

        this.prepareProgressCircle();

        this.choosePrivacyShown();

        if (this._container && this._isLoaded) {
            this._container.style.visibility = 'visible';
            this._container.style.display = 'block';
            this._mraidEventBridge.sendViewableEvent(true);
        } else {
            SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.ShowNotReady);
            this.onCloseEvent();
        }
    }

    public hide(): void {
        super.hide();

        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Hide);

        this._mraidEventBridge.sendViewableEvent(false);

        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }
    }

    private closeAd(): void {
        if (this._canClose) {
            SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Close);
            this.onCloseEvent();
        }
    }

    public onCloseEvent(): void {
        this._handlers.forEach(handler => handler.onEndScreenClose());

        this._mraidEventBridge.stop();
    }

    private choosePrivacyShown(): void {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';

            SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'shown' });
        } else {
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

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        this._privacy.show();

        SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'popup' });
    }

    protected onPrivacyEvent(): void {
        SDKMetrics.reportMetricEventWithTags(ExternalMRAIDEndScreenMetric.GDPR, { 'type': 'privacy' });

        super.onPrivacyEvent();
    }

    private replaceMraidSources(mraid: string): string {
        // Workaround for https://jira.hq.unity3d.com/browse/ABT-333
        // On certain versions of the webview on iOS (2.0.2 - 2.0.8) there seems
        // to be some sort of race where the parsed document returns a null
        // documentElement which throws an exception.

        let dom: Document;
        if (this._platform === Platform.IOS) {
            dom = DOMUtils.parseFromString(mraid, 'text/html');
        } else {
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
    public onReady(): void {
        // ready
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.MRAIDEventBridgeReady);
    }

    public onClose(): void {
        // close
        this.closeAd();
    }

    public onLoaded(): void {
        // loaded
        this._isLoaded = true;
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.MRAIDEventBridgeLoaded);
    }

    public onOpen(url: string): void {
        // open
        SDKMetrics.reportMetricEvent(ExternalMRAIDEndScreenMetric.Click);
        this.onDownloadEvent();
    }
}
