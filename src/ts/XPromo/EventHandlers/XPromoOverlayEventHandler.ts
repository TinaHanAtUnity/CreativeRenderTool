import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { OverlayEventHandlerWithDownloadSupport } from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
import { IStoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';

export class XPromoOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport<XPromoCampaign> {
    private _xPromoAdUnit: XPromoAdUnit;

    constructor(adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler);
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
