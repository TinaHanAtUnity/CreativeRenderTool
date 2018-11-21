import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { OverlayEventHandlerWithDownloadSupport } from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { IAppStoreDownloadHelper } from 'Ads/Utilities/AppStoreDownloadHelper';

export class XPromoOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport<XPromoCampaign> {
    private _xPromoAdUnit: XPromoAdUnit;

    constructor(adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters, downloadHelper: IAppStoreDownloadHelper) {
        super(adUnit, parameters, downloadHelper);
        this._xPromoAdUnit = adUnit;
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._xPromoAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._xPromoAdUnit.onFinish.trigger();
    }
}
