import { EndScreenEventHandler } from 'EventHandlers/EndScreenEventHandler';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';

export class MRAIDEndScreenEventHandler extends EndScreenEventHandler<MRAIDCampaign, MRAIDAdUnit> {
    constructor(nativeBridge: NativeBridge, adUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.isShowingMRAID()) {
            this._adUnit.hide();
        }
    }
}
