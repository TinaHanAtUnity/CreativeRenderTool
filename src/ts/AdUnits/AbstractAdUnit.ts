import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnitContainer } from 'AdUnits/AdUnitContainer';

export abstract class AbstractAdUnit {

    public static setAutoClose(value: boolean) {
        AbstractAdUnit._autoClose = value;
    }

    public static getAutoClose() {
        return AbstractAdUnit._autoClose;
    }

    public static setAutoCloseDelay(value: number) {
        AbstractAdUnit._autoCloseDelay = value;
    }

    public static getAutoCloseDelay() {
        return AbstractAdUnit._autoCloseDelay;
    }

    private static _autoClose = false;
    private static _autoCloseDelay: number = 0;

    public onStart: Observable0 = new Observable0();
    public onFinish: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    protected _nativeBridge: NativeBridge;
    protected _container: AdUnitContainer;
    protected _placement: Placement;
    protected _campaign: Campaign;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: Campaign) {
        this._nativeBridge = nativeBridge;
        this._container = container;
        this._placement = placement;
        this._campaign = campaign;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract isShowing(): boolean;

    public abstract description(): string;

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

}
