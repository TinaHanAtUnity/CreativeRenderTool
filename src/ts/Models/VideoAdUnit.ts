import { AdUnit } from 'Models/AdUnit';
import { Placement } from 'Placement';
import { Campaign } from 'Campaign';

export class VideoAdUnit extends AdUnit {
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    constructor(placement: Placement, campaign: Campaign) {
        super(placement, campaign);

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;
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