import { EndScreenEventHandler, IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Ads/AdUnits/PerformanceAdUnit';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { KeyCode } from 'Common/Constants/Android/KeyCode';
import { ICometTrackingUrlEvents } from 'Ads/Parsers/CometCampaignParser';

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
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);
    }
}
