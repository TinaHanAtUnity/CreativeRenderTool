import { NativeBridge } from 'Native/NativeBridge';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'AdUnits/XPromoAdUnit';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';

export class XPromoOverlayEventHandler extends OverlayEventHandler<XPromoCampaign> {
    private _xPromoAdUnit: XPromoAdUnit;

    constructor(nativeBridge: NativeBridge, adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);
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
