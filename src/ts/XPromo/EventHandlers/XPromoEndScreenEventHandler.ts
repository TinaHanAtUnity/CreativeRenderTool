import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { StoreHandler } from 'Ads/EventHandlers/StoreHandler/StoreHandler';

export class XPromoEndScreenEventHandler extends EndScreenEventHandler<XPromoCampaign, XPromoAdUnit> {

    constructor(adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters, storeHandler: StoreHandler) {
        super(adUnit, parameters, storeHandler);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }
}
