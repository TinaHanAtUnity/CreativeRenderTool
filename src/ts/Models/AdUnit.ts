import { Zone } from 'Zone';
import { Campaign } from 'Campaign';

export enum FinishState {
    COMPLETED,
    SKIPPED,
    ERROR
}

export class AdUnit {
    private _zone: Zone;
    private _campaign: Campaign;
    private _finishState: FinishState;

    constructor(zone: Zone, campaign: Campaign) {
        this._zone = zone;
        this._campaign = campaign;
    }

    public getZone(): Zone {
        return this._zone;
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