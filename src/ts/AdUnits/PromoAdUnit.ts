import { AbstractAdUnit } from "AdUnits/AbstractAdUnit";
import { NativeBridge } from "Native/NativeBridge";
import { AdUnitContainer, ForceOrientation } from "AdUnits/Containers/AdUnitContainer";
import { SessionManager } from "Managers/SessionManager";
import { Placement } from "Models/Placement";
import { Campaign } from "Models/Campaign";
import { Promo } from 'Views/Promo';

export class PromoAdUnit extends AbstractAdUnit {

    private _promoView: Promo;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: Campaign, promo: Promo, options: any) {
        super(nativeBridge, container, placement, campaign);

        this._promoView = promo;
    }
    public show(): Promise<void> {
        this._promoView.show();

        return this._container.open(this, false, false, ForceOrientation.NONE, true, true, {} );
    }

    public hide(): Promise<void> {
        this._promoView.hide();

        this.unsetReferences();
        return this._container.close();
    }

    public description(): string {
        return 'mraid';
    }

    private unsetReferences() {
        delete this._promoView;
    }
}
