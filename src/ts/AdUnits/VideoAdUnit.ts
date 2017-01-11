import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Observable0 } from 'Utilities/Observable';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';
import { AdUnitContainer } from 'AdUnits/AdUnitContainer';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Double } from 'Utilities/Double';

export abstract class VideoAdUnit extends AbstractAdUnit {

    private static _progressInterval: number = 250;

    public onVideoStart: Observable0 = new Observable0();
    public onVideoFinish: Observable0 = new Observable0();
    public onVideoClose: Observable0 = new Observable0();
    public onVideoError: Observable0 = new Observable0();

    private _finishState: FinishState;

    private _overlay: AbstractVideoOverlay | undefined;
    private _options: any;

    private _onShowObserver: any;
    private _onSystemKillObserver: any;
    private _onSystemInterruptObserver: any;

    private _videoStarted: boolean;
    private _videoErrorStatus: boolean;
    private _videoDuration: number;
    private _videoPosition: number;
    private _videoPositionRepeats: number;
    private _videoQuartile: number;
    private _videoActive: boolean;
    private _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: Campaign, overlay: AbstractVideoOverlay, options: any) {
        super(nativeBridge, container, placement, campaign);

        this._container = container;
        this._overlay = overlay;
        this._options = options;

        this._videoStarted = false;
        this._videoErrorStatus = false;
        this._videoPosition = 0;
        this._videoPositionRepeats = 0;
        this._videoQuartile = 0;
        this._videoActive = true;

        this.onVideoClose.subscribe(() => this.onClose.trigger());
        this.onVideoFinish.subscribe(() => this.onFinish.trigger());
        this.onVideoStart.subscribe(() => this.onStart.trigger());
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this.setVideoActive(true);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe(() => this.onSystemInterrupt());

        return this._container.open(this, true, !this._placement.useDeviceOrientationForVideo(), this._placement.disableBackButton(), this._options);
    }

    public hide(): Promise<void> {
        if(!this._showing) {
            return Promise.resolve();
        }
        this._showing = false;

        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close().then(() => {
            this.onVideoClose.trigger();
        });
    }

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

    public getOverlay(): AbstractVideoOverlay | undefined {
        return this._overlay;
    }

    public getProgressInterval(): number {
        return VideoAdUnit._progressInterval;
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

    private hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.container().parentElement!.removeChild(overlay.container());
        }
    };

    private getVideoUrl(): string {
        const campaign = this._campaign;
        if(campaign instanceof PerformanceCampaign) {
            return campaign.getVideo().isCached() ? campaign.getVideo().getUrl() : campaign.getStreamingVideo().getUrl();
        } else if(campaign instanceof VastCampaign) {
            return campaign.getVideo().getUrl();
        }
        throw new Error('Not a video campaign');
    }

    private onShow() {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getVideoUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
        }
    }

    private onSystemKill() {
        if(this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onSystemInterrupt(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
            this._nativeBridge.VideoPlayer.play();
        }
    }

}
