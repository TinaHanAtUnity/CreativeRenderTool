import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export class XPromoOverlayEventHandler extends OverlayEventHandler<XPromoCampaign> {
    private _xPromoAdUnit: XPromoAdUnit;

    constructor(adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters) {
        super(adUnit, parameters);
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
