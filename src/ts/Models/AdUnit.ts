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
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    constructor(placement: Placement, campaign: Campaign) {
        this._placement = placement;
        this._campaign = campaign;
        this._videoPosition = 0;
        this._watches = 0;
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

    public getVideoPosition(): number {
        return this._videoPosition;
    }

    public setVideoPosition(position: number): void {
        this._videoPosition = position;
    }

    public isVideoActive(): boolean {
        return this._videoActive;
    }

    public setVideoActive(active: boolean): void {
        this._videoActive = active;
    }

    public getWatches(): number {
        return this._watches;
    }

    public setWatches(watches: number): void {
        this._watches = watches;
    }
}