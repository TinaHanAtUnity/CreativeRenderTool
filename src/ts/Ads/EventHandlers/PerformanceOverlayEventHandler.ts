import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Ads/AdUnits/PerformanceAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Ads/Parsers/CometCampaignParser';
import { NativeBridge } from 'Common/Native/NativeBridge';

export class PerformanceOverlayEventHandler extends OverlayEventHandler<PerformanceCampaign> {

    private _performanceAdUnit: PerformanceAdUnit;
    private _trackingUrls: {[key: string]: string[]};
    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._trackingUrls = parameters.campaign.getTrackingUrls();
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
