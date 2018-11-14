import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { AppStoreDownloadHelper } from 'Ads/Utilities/AppStoreDownloadHelper';

export class XPromoEndScreenEventHandler extends EndScreenEventHandler<XPromoCampaign, XPromoAdUnit> {
    constructor(adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters, downloadHelper: AppStoreDownloadHelper) {
        super(adUnit, parameters, downloadHelper);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowingAd() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }
}
