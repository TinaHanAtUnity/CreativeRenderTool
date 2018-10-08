import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';

export class MRAIDEndScreenEventHandler extends EndScreenEventHandler<MRAIDCampaign, MRAIDAdUnit> {
    constructor(adUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters) {
        super(adUnit, parameters);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.isShowingMRAID()) {
            this._adUnit.hide();
        }
    }
}
