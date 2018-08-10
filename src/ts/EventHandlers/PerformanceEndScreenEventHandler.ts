import { EndScreenEventHandler, IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';

export class PerformanceEndScreenEventHandler extends EndScreenEventHandler<PerformanceCampaign, PerformanceAdUnit> {

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }

    public onEndScreenDownload(parameters: IEndScreenDownloadParameters): void {
        super.onEndScreenDownload(parameters);
        const urls = this._campaign.getTrackingUrls()[ICometTrackingUrlEvents.CLICK];
        if (Object.keys(urls).length !== 0) {
            for (const url of urls) {
                if (url && Url.isValid(url)) {
                    this._thirdPartyEventManager.sendEvent(ICometTrackingUrlEvents.CLICK, this._campaign.getSession().getId(), url);
                } else {
                    const error = {
                        url: url,
                        event: ICometTrackingUrlEvents.CLICK
                    };
                    Diagnostics.trigger('invalid_tracking_url', error, this._campaign.getSession());
                }
            }
        }
    }
}
