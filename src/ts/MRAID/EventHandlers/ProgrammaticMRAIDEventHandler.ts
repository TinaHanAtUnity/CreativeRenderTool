import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';

export class ProgrammaticMRAIDEventHandler extends MRAIDEventHandler implements IMRAIDViewHandler {

    public onMraidClick(url: string): Promise<void> {
        super.onMraidClick(url);

        this._mraidView.setCallButtonEnabled(false);

        const ctaClickedTime = Date.now();
        return this._request.followRedirectChain(url, this._campaign.getUseWebViewUserAgentForTracking()).then((storeUrl) => {
            return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, url);
        }).catch(() => {
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

            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'programmatic_mraid', this._campaign, this._abGroup.valueOf(), this._gameSessionId);
        }).catch(() => {
            this._mraidView.setCallButtonEnabled(true);
            this.sendTrackingEvents();
        });
    }

    private getTopViewHeight(width: number, height: number): number {
        const webViewResizer = new WebViewTopCalculator(this._deviceInfo, this._platform);
        return webViewResizer.getTopPosition(width, height);
    }
}
