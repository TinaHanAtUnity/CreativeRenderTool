import { EndScreenEventHandler, IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

export class PerformanceEndScreenEventHandler extends EndScreenEventHandler<PerformanceCampaign, PerformanceAdUnit> {

    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler);
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }

    public onEndScreenDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onEndScreenDownload(parameters);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);
    }
}
