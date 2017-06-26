import { AbstractAdUnit } from "AdUnits/AbstractAdUnit";
import { NativeBridge } from "Native/NativeBridge";
import { AdUnitContainer, ForceOrientation } from "AdUnits/Containers/AdUnitContainer";
import { Placement } from "Models/Placement";
import { Campaign } from "Models/Campaign";
import { Promo } from 'Views/Promo';
import { IObserver0 } from 'Utilities/IObserver';
import { FinishState } from 'Constants/FinishState';
import { PromoCampaign } from 'Models/PromoCampaign';
import { Image } from 'Models/Assets/Image';

export class PromoAdUnit extends AbstractAdUnit {

    private _promoView: Promo;
    private _options: any;

    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: Campaign, promo: Promo, options: any) {
        super(nativeBridge, ForceOrientation.PORTRAIT, container, placement, campaign);

        this._promoView = promo;
        this._options = options;
    }
    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this._promoView.show();

        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, false, ForceOrientation.NONE, true, true, false, true, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._promoView.hide();
        this._promoView.container().parentElement!.removeChild(this._promoView.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        this.onFinish.trigger();
        this.onClose.trigger();
        return this._container.close();
    }

    public isCached(): boolean {
        const asset: Image | undefined = (<PromoCampaign>this.getCampaign()).getLandscape();
        if(asset) {
            return asset.isCached();
        }
        return false;
    }

    public description(): string {
        return 'promo';
    }

    private unsetReferences() {
        delete this._promoView;
    }

    private onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }
}
