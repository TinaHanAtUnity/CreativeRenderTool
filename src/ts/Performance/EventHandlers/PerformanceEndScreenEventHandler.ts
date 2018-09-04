import { EndScreenEventHandler, IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';

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
