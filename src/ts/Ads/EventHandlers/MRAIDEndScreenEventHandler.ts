import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { MRAIDCampaign } from 'Ads/Models/Campaigns/MRAIDCampaign';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'Ads/AdUnits/MRAIDAdUnit';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { KeyCode } from 'Common/Constants/Android/KeyCode';

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
