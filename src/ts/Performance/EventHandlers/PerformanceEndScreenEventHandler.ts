import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export class PerformanceEndScreenEventHandler extends EndScreenEventHandler<PerformanceCampaign, PerformanceAdUnit> {

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }

    public onEndScreenDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onEndScreenDownload(parameters);
        this._adUnit.sendTrackingEvent(TrackingEvent.CLICK);
    }
}
