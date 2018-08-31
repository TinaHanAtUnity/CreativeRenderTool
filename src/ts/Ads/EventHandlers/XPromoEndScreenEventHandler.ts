import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { XPromoCampaign } from 'Ads/Models/Campaigns/XPromoCampaign';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'Ads/AdUnits/XPromoAdUnit';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { KeyCode } from 'Common/Constants/Android/KeyCode';

export class XPromoEndScreenEventHandler extends EndScreenEventHandler<XPromoCampaign, XPromoAdUnit> {
    constructor(nativeBridge: NativeBridge, adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }
}
