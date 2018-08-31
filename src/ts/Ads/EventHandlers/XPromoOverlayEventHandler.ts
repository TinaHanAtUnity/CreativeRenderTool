import { NativeBridge } from 'Common/Native/NativeBridge';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'Ads/AdUnits/XPromoAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { XPromoCampaign } from 'Ads/Models/Campaigns/XPromoCampaign';

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
