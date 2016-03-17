import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { FinishState } from 'Constants/FinishState';

export abstract class AbstractAdUnit {

    protected _placement;
    protected _campaign;

    protected _finishState;

    protected _showing: boolean = false;

    constructor(placement: Placement, campaign: Campaign) {
        this._placement = placement;
        this._campaign = campaign;
    }

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
