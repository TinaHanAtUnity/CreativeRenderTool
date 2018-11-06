import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { DownloadEventHandler } from 'Ads/EventHandlers/DownloadEventHandler';

export class XPromoEndScreenEventHandler extends EndScreenEventHandler<XPromoCampaign, XPromoAdUnit> {
    constructor(nativeBridge: NativeBridge, adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters, downloadHelper: DownloadEventHandler) {
        super(nativeBridge, adUnit, parameters, downloadHelper);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }
}
