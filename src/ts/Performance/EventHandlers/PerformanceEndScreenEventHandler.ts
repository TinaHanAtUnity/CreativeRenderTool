import { EndScreenEventHandler, IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { IAppStoreDownloadHelper, IDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

export class PerformanceEndScreenEventHandler extends EndScreenEventHandler<PerformanceCampaign, PerformanceAdUnit> {

    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, downloadHelper: IAppStoreDownloadHelper) {
        super(adUnit, parameters, downloadHelper);
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }

    public onEndScreenDownload(parameters: IDownloadParameters): void {
        super.onEndScreenDownload(parameters);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);
    }
}
