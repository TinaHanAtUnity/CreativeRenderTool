import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

export abstract class AbstractAdUnit {

    public onStart: Observable0 = new Observable0();
    public onFinish: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    protected _nativeBridge: NativeBridge;
    protected _placement: Placement;
    protected _campaign: Campaign;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign) {
        this._nativeBridge = nativeBridge;
        this._placement = placement;
        this._campaign = campaign;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract isShowing(): boolean;

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }
}
