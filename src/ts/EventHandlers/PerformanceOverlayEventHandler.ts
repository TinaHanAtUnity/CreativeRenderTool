import { NativeBridge } from 'Native/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

export class PerformanceOverlayEventHandler extends OverlayEventHandler<PerformanceCampaign> {
    private _performanceAdUnit: PerformanceAdUnit;
    private _performanceOperativeEventManger: OperativeEventManager;
    private _performanceCampaign: PerformanceCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._performanceOperativeEventManger = parameters.operativeEventManager;
        this._performanceCampaign = parameters.campaign;
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._performanceAdUnit.onFinish.trigger();
    }
}
