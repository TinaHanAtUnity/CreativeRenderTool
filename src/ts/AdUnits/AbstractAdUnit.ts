import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { FinishState } from 'Constants/FinishState';
import { Observable0 } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';

export abstract class AbstractAdUnit {

    public onStart: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    protected _placement;
    protected _campaign;

    protected _finishState;

    protected _showing: boolean = false;

    constructor(placement: Placement, campaign: Campaign) {
        this._placement = placement;
        this._campaign = campaign;
    }

    public abstract show(requestedOrientation: ScreenOrientation, keyEvents: KeyCode[]): Promise<void>;
    public abstract hide(): Promise<void>;

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public setFinishState(finishState: FinishState) {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }

    public getFinishState(): FinishState {
        return this._finishState;
    }

    public isShowing(): boolean {
        return this._showing;
    }

}
