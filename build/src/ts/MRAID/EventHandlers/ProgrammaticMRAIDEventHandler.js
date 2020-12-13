import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';
import { Url } from 'Core/Utilities/Url';
export class ProgrammaticMRAIDEventHandler extends MRAIDEventHandler {
    onMraidClick(url) {
        if (this._jaegerSpan) {
            this._jaegerSpan.addAnnotation(`onMRAIDClick from ProgrammaticMRAIDEventHandler after onBridgeOpen ${url}`);
        }
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
    onWebViewFullScreen() {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
            .then(([width, height]) => {
            return this._adUnit.getContainer().setViewFrame('webview', 0, 0, width, height);
        });
    }
    // Handles webview resizing when webview is overlaying webplayer - for privacy modal
    onWebViewReduceSize() {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
            .then(([width, height]) => {
            return this._adUnit.getContainer().setViewFrame('webview', 0, 0, width, this.getTopViewHeight(width, height));
        });
    }
    openUrlOnCallButton(url, clickDuration, clickUrl) {
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
    getTopViewHeight(width, height) {
        const webViewResizer = new WebViewTopCalculator(this._deviceInfo, this._platform);
        return webViewResizer.getTopPosition(width, height);
    }
    setJaegerSpan(jaegerSpan) {
        this._jaegerSpan = jaegerSpan;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTVJBSURFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvRXZlbnRIYW5kbGVycy9Qcm9ncmFtbWF0aWNNUkFJREV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUUxRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUVwRixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFekMsTUFBTSxPQUFPLDZCQUE4QixTQUFRLGlCQUFpQjtJQUl6RCxZQUFZLENBQUMsR0FBVztRQUMzQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsc0VBQXNFLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDL0c7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFNUMsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ2xJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDbEIs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