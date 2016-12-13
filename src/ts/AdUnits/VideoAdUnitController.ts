import { Placement } from 'Models/Placement';
import { Overlay } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { FinishState } from 'Constants/FinishState';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export abstract class VideoAdUnitController {

    private static _progressInterval: number = 250;

    public onVideoStart: Observable0 = new Observable0();
    public onVideoFinish: Observable0 = new Observable0();
    public onVideoClose: Observable0 = new Observable0();
    public onVideoError: Observable0 = new Observable0();

    protected _finishState: FinishState;

    protected _nativeBridge: NativeBridge;
    protected _placement: Placement;
    protected _campaign: Campaign;
    protected _overlay: Overlay | undefined;

    protected _videoStarted: boolean;
    protected _videoErrorStatus: boolean;
    protected _videoDuration: number;
    protected _videoPosition: number;
    protected _videoPositionRepeats: number;
    protected _videoQuartile: number;
    protected _videoActive: boolean;
    protected _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay) {
        this._nativeBridge = nativeBridge;
        this._placement = placement;
        this._campaign = campaign;
        this._overlay = overlay;

        this._videoStarted = false;
        this._videoErrorStatus = false;
        this._videoPosition = 0;
        this._videoPositionRepeats = 0;
        this._videoQuartile = 0;
        this._videoActive = true;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public isShowing(): boolean {
        return this._showing;
    }

    public isVideoStarted(): boolean {
        return this._videoStarted;
    }

    public setVideoStarted(started: boolean): void {
        this._videoStarted = started;
    }

    public getVideoErrorStatus(): boolean {
        return this._videoErrorStatus;
    }

    public setVideoErrorStatus(status: boolean): void {
        this._videoErrorStatus = status;
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

    public getOverlay(): Overlay | undefined {
        return this._overlay;
    }

    public getProgressInterval(): number {
        return VideoAdUnitController._progressInterval;
    }

    public setFinishState(finishState: FinishState) {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }

    public getFinishState(): FinishState {
        return this._finishState;
    }

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    protected unsetReferences() {
        delete this._overlay;
    }

    protected hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.container().parentElement!.removeChild(overlay.container());
        }
    };

    protected getVideoUrl(): string {
        const campaign = this._campaign;
        if(campaign instanceof PerformanceCampaign) {
            return campaign.getVideo().isCached() ? campaign.getVideo().getUrl() : campaign.getStreamingVideo().getUrl();
        } else if(campaign instanceof VastCampaign) {
            return campaign.getVideo().getUrl();
        }
        throw new Error('Not a video campaign');
    }
}
