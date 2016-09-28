import { Placement } from 'Models/Placement';
import { Overlay } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export abstract class VideoAdUnit extends AbstractAdUnit {

    private static _progressInterval: number = 250;

    protected _overlay: Overlay | undefined;

    protected _videoDuration: number;
    protected _videoPosition: number;
    protected _videoPositionRepeats: number;
    protected _videoQuartile: number;
    protected _videoActive: boolean;
    protected _watches: number;
    protected _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay) {
        super(nativeBridge, placement, campaign);

        this._videoPosition = 0;
        this._videoPositionRepeats = 0;
        this._videoQuartile = 0;
        this._videoActive = true;
        this._watches = 0;

        this._overlay = overlay;
    }

    protected hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.container().parentElement.removeChild(overlay.container());
        }
    };

    public isShowing(): boolean {
        return this._showing;
    }

    public getWatches(): number {
        return this._watches;
    }

    public getVideoDuration(): number {
        return this._videoDuration;
    }

    public setVideoDuration(duration: number): void {
        this._videoDuration = duration;
    }

    public getVideoPosition(): number {
        return this._videoPosition;
    }

    public setVideoPosition(position: number): void {
        this._videoPosition = position;

        if(this._videoDuration) {
            this._videoQuartile = Math.floor((this._videoPosition * 4) / this._videoDuration);
        }
    }

    public getVideoPositionRepeats(): number {
        return this._videoPositionRepeats;
    }

    public setVideoPositionRepeats(repeats: number): void {
        this._videoPositionRepeats = repeats;
    }

    public getVideoQuartile(): number {
        return this._videoQuartile;
    }

    public isVideoActive(): boolean {
        return this._videoActive;
    }

    public setVideoActive(active: boolean): void {
        this._videoActive = active;
    }

    public setWatches(watches: number): void {
        this._watches = watches;
    }

    public getOverlay(): Overlay | undefined {
        return this._overlay;
    }

    public newWatch() {
        this._watches += 1;
    }

    protected unsetReferences() {
        delete this._overlay;
    }

    public getProgressInterval(): number {
        return VideoAdUnit._progressInterval;
    }
}
