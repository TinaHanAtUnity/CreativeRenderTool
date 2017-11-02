import { EndScreenEventHandler } from 'EventHandlers/EndScreenEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';

export class PerformanceEndScreenEventHandler extends EndScreenEventHandler<PerformanceCampaign, PerformanceAdUnit> {
    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.isActive()) {
            this._adUnit.hide();
        }
    }
}
