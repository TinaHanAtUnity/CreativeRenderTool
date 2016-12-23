import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnit } from 'Utilities/AdUnit';

export abstract class AbstractAdUnit {

    public static setAutoClose(value: boolean) {
        AbstractAdUnit._autoClose = value;
    }

    public static getAutoClose() {
        return AbstractAdUnit._autoClose;
    }

    private static _autoClose = false;

    public onStart: Observable0 = new Observable0();
    public onFinish: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    protected _nativeBridge: NativeBridge;
    protected _adUnit: AdUnit;
    protected _placement: Placement;
    protected _campaign: Campaign;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, placement: Placement, campaign: Campaign) {
        this._nativeBridge = nativeBridge;
        this._adUnit = adUnit;
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
