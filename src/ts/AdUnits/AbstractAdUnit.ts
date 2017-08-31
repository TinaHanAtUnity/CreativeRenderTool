import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { FinishState } from 'Constants/FinishState';
import { Session } from 'Models/Session';

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

    public readonly onStart = new Observable0();
    public readonly onStartProcessed = new Observable0();
    public readonly onFinish = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onError = new Observable0();

    protected readonly _nativeBridge: NativeBridge;
    protected readonly _session: Session;
    protected readonly _forceOrientation: ForceOrientation;
    protected readonly _container: AdUnitContainer;
    protected readonly _placement: Placement;
    protected readonly _campaign: Campaign;

    private _showing: boolean;
    private _finishState: FinishState;

    constructor(nativeBridge: NativeBridge, session: Session, forceOrientation: ForceOrientation, container: AdUnitContainer, placement: Placement, campaign: Campaign) {
        this._nativeBridge = nativeBridge;
        this._session = session;
        this._forceOrientation = forceOrientation;
        this._container = container;
        this._placement = placement;
        this._campaign = campaign;

        this._showing = false;
        this._finishState = FinishState.ERROR;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract description(): string;

    public abstract isCached(): boolean;

    public isShowing() {
        return this._showing;
    }

    public setShowing(showing: boolean) {
        this._showing = showing;
    }

    public getContainer(): AdUnitContainer {
        return this._container;
    }

    public getForceOrientation(): ForceOrientation {
        return this._forceOrientation;
    }

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public getFinishState() {
        return this._finishState;
    }

    public getSession() {
        return this._session;
    }

    public setFinishState(finishState: FinishState) {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }
}
