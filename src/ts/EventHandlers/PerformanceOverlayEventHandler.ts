import { NativeBridge } from 'Native/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';

export class PerformanceOverlayEventHandler extends OverlayEventHandler<PerformanceCampaign> {

    private _performanceAdUnit: PerformanceAdUnit;
    private _videoEventUrls: {[eventType: string]: string};
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _sessionId: string;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._videoEventUrls = parameters.campaign.getVideoEventUrls();
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._sessionId = parameters.campaign.getSession().getId();
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._performanceAdUnit.onFinish.trigger();

        const skipUrl = this._videoEventUrls[ICometTrackingUrlEvents.SKIP];
        if (skipUrl) {
            this._thirdPartyEventManager.sendEvent(ICometTrackingUrlEvents.SKIP, this._sessionId, skipUrl);
        }
    }
}
