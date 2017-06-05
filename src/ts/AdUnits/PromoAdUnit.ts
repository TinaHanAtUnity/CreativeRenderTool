import { AbstractAdUnit } from "AdUnits/AbstractAdUnit";
import { NativeBridge } from "Native/NativeBridge";
import { AdUnitContainer, ForceOrientation } from "AdUnits/Containers/AdUnitContainer";
import { SessionManager } from "Managers/SessionManager";
import { Placement } from "Models/Placement";
import { Campaign } from "Models/Campaign";
import { Promo } from 'Views/Promo';

export class PromoAdUnit extends AbstractAdUnit {

    private _promoView: Promo;
    private _options: any;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: Campaign, promo: Promo, options: any) {
        super(nativeBridge, container, placement, campaign);

        this._promoView = promo;
        this._options = options;
    }
    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this._promoView.show();

        return this._container.open(this, false, false, ForceOrientation.NONE, true, true, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._promoView.hide();
        this._promoView.container().parentElement!.removeChild(this._promoView.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        this.onFinish.trigger();
        this.onClose.trigger();
        return this._container.close();
    }

    public description(): string {
        return 'promo';
    }

    private unsetReferences() {
        delete this._promoView;
    }
}
