import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { Url } from 'Core/Utilities/Url';
import { SDKMetrics, MraidWebplayerMetric } from 'Ads/Utilities/SDKMetrics';

export class ProgrammaticMRAIDEventHandler extends MRAIDEventHandler implements IMRAIDViewHandler {

    private _jaegerSpan?: JaegerSpan;

    public onMraidClick(url: string): Promise<void> {
        if (this._jaegerSpan) {
            this._jaegerSpan.addAnnotation(`onMRAIDClick from ProgrammaticMRAIDEventHandler after onBridgeOpen ${url}`);
        }
        console.log('mraid ad clicked');
        SDKMetrics.reportMetricEvent(MraidWebplayerMetric.MraidAdClicked);
        super.onMraidClick(url);

        this._mraidView.setCallButtonEnabled(false);

        const redirectBreakers = Url.getAppStoreUrlTemplates(this._platform);
        const ctaClickedTime = Date.now();
        return this._request.followRedirectChain(url, this._campaign.getUseWebViewUserAgentForTracking(), redirectBreakers).then((storeUrl) => {
            if (this._jaegerSpan) {
                this._jaegerSpan.addAnnotation(`onMRAIDClick from ProgrammaticMRAIDEventHandler after followRedirectChain success ${storeUrl}`);
            }
            return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, url);
        }).catch((e) => {
            if (this._jaegerSpan) {
                this._jaegerSpan.addAnnotation(`onMRAIDClick from ProgrammaticMRAIDEventHandler after followRedirectChain fail ${e.message}`);
            }
            return this.openUrlOnCallButton(url, Date.now() - ctaClickedTime, url);
        });
    }

    // Handles webview resizing when webview is overlaying webplayer - for privacy modal
    public onWebViewFullScreen(): Promise<void> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
        .then(([width, height]) => {
            return this._adUnit.getContainer().setViewFrame('webview', 0, 0, width, height);
        });
    }

    // Handles webview resizing when webview is overlaying webplayer - for privacy modal
    public onWebViewReduceSize(): Promise<void> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
        .then(([width, height]) => {
            return this._adUnit.getContainer().setViewFrame('webview', 0, 0, width, this.getTopViewHeight(width, height));
        });
    }

    private openUrlOnCallButton(url: string, clickDuration: number, clickUrl: string): Promise<void> {
        return this.openUrl(url).then(() => {
            this._mraidView.setCallButtonEnabled(true);
            this.sendTrackingEvents();
            let clickLocation = 'programmatic_mraid';
            if (this._jaegerSpan) {
                this._jaegerSpan.addAnnotation(`openUrlOnCallButton from ProgrammaticMRAIDEventHandler after openURL success ${url}`);
                clickLocation = 'programmatic_mraid_webplayer';
            }

            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, clickLocation, this._campaign, this._abGroup.valueOf(), this._gameSessionId);
        }).catch((e) => {
            this._mraidView.setCallButtonEnabled(true);
            this.sendTrackingEvents();
            if (this._jaegerSpan) {
                this._jaegerSpan.addAnnotation(`openUrlOnCallButton from ProgrammaticMRAIDEventHandler after openURL fail ${e.message}`);
            }
        });
    }

    private getTopViewHeight(width: number, height: number): number {
        const webViewResizer = new WebViewTopCalculator(this._deviceInfo, this._platform);
        return webViewResizer.getTopPosition(width, height);
    }

    public setJaegerSpan(jaegerSpan: JaegerSpan) {
        this._jaegerSpan = jaegerSpan;
    }
}
