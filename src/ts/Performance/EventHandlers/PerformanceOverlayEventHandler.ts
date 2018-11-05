import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';

export class PerformanceOverlayEventHandler extends OverlayEventHandler<PerformanceCampaign> {

    private _trackingUrls: {[key: string]: string[]};
    protected _performanceAdUnit: PerformanceAdUnit;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

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
