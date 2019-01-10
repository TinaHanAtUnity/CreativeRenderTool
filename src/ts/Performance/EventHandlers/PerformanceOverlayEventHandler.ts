import {
    IVideoOverlayDownloadParameters,
    OverlayEventHandlerWithDownloadSupport
} from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { IStoreHandler } from 'Ads/EventHandlers/StoreHandler/StoreHandler';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';

export class PerformanceOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport<PerformanceCampaign> {

    protected _performanceAdUnit: PerformanceAdUnit;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        super.onOverlayDownload(parameters);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._performanceAdUnit.onFinish.trigger();

        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.SKIP);
    }
}
