import { Placement } from 'Placement';
import { Campaign } from 'Campaign';

export enum FinishState {
    COMPLETED,
    SKIPPED,
    ERROR
}

export class AdUnit {
    private _placement: Placement;
    private _campaign: Campaign;
    private _finishState: FinishState;

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

    public getFinishState(): FinishState {
        return this._finishState;
    }

    public setFinishState(finishState: FinishState): void {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }
}