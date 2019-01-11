import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';

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

    private openUrlOnCallButton(url: string, clickDuration: number, clickUrl: string): Promise<void> {
        return this.openUrl(url).then(() => {
            this._mraidView.setCallButtonEnabled(true);
            this.sendTrackingEvents();

            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'programmatic_mraid', this._campaign, this._gameSessionId);
        }).catch(() => {
            this._mraidView.setCallButtonEnabled(true);
            this.sendTrackingEvents();
        });
    }

}
