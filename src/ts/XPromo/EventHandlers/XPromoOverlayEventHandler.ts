import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { OverlayEventHandlerWithDownload } from 'Ads/EventHandlers/OverlayEventHandlerWithDownload';
import { IDownloadEventHandler } from 'Ads/EventHandlers/DownloadEventHandler';

export class XPromoOverlayEventHandler extends OverlayEventHandlerWithDownload<XPromoCampaign> {
    private _xPromoAdUnit: XPromoAdUnit;

    constructor(nativeBridge: NativeBridge, adUnit: XPromoAdUnit, parameters: IXPromoAdUnitParameters, downloadHelper: IDownloadEventHandler) {
        super(nativeBridge, adUnit, parameters, downloadHelper);
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
