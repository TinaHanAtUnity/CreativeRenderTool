import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';

export abstract class VideoAdUnit extends AbstractAdUnit {
    private static _progressInterval: number = 250;

    protected _overlay: Overlay;
    protected _endScreen: EndScreen;
    protected _videoDuration: number;
    protected _videoPosition: number;
    protected _videoPositionRepeats: number;
    protected _videoQuartile: number;
    protected _videoActive: boolean;
    protected _watches: number;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay, endScreen: EndScreen) {
        super(nativeBridge, placement, campaign);

        this._videoPosition = 0;
        this._videoPositionRepeats = 0;
        this._videoQuartile = 0;
        this._videoActive = true;
        this._watches = 0;

        this._overlay = overlay;
        this._endScreen = endScreen;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract setNativeOptions(options: any): void;

    protected hideChildren() {
        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
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

    public getOverlay(): Overlay {
        return this._overlay;
    }

    public getEndScreen(): EndScreen {
        return this._endScreen;
    }

    public newWatch() {
        this._watches += 1;
    }

    public unsetReferences() {
        this._endScreen = null;
        this._overlay = null;
    }

    public getProgressInterval(): number {
        return VideoAdUnit._progressInterval;
    }
}
