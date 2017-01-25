import { Placement } from 'Models/Placement';
import { Overlay } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { FinishState } from 'Constants/FinishState';
import { AdUnit } from 'Utilities/AdUnit';
import { Double } from 'Utilities/Double';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Platform } from 'Constants/Platform';
import { IosUtils } from 'Utilities/IosUtils';
import { DeviceInfo } from 'Models/DeviceInfo';

export class VideoAdUnitController {

    private static _progressInterval: number = 250;

    public onVideoStart: Observable0 = new Observable0();
    public onVideoFinish: Observable0 = new Observable0();
    public onVideoClose: Observable0 = new Observable0();
    public onVideoError: Observable0 = new Observable0();

    private _finishState: FinishState;

    private _nativeBridge: NativeBridge;
    private _adUnit: AdUnit;
    private _placement: Placement;
    private _campaign: Campaign;
    private _deviceInfo: DeviceInfo;
    private _overlay: Overlay | undefined;
    private _options: any;

    private _onShowObserver: any;
    private _onSystemKillObserver: any;
    private _onSystemPauseObserver: any;
    private _onSystemInterruptObserver: any;

    private _videoStarted: boolean;
    private _videoErrorStatus: boolean;
    private _videoDuration: number;
    private _videoPosition: number;
    private _videoPositionRepeats: number;
    private _videoQuartile: number;
    private _videoActive: boolean;
    private _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, placement: Placement, campaign: Campaign, deviceInfo: DeviceInfo, overlay: Overlay, options: any) {
        this._nativeBridge = nativeBridge;
        this._adUnit = adUnit;
        this._placement = placement;
        this._campaign = campaign;
        this._deviceInfo = deviceInfo;
        this._overlay = overlay;
        this._options = options;

        this._videoStarted = false;
        this._videoErrorStatus = false;
        this._videoPosition = 0;
        this._videoPositionRepeats = 0;
        this._videoQuartile = 0;
        this._videoActive = true;
    }

    public show(adUnit: AbstractAdUnit): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this.setVideoActive(true);

        this._onShowObserver = this._adUnit.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._adUnit.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemPauseObserver = this._adUnit.onSystemPause.subscribe(() => this.onSystemPause());
        this._onSystemInterruptObserver = this._adUnit.onSystemInterrupt.subscribe(() => this.onSystemInterrupt());

        return this._adUnit.open(adUnit, true, !this._placement.useDeviceOrientationForVideo(), this._placement.disableBackButton(), this._options);
    }

    public hide(): Promise<void> {
        if(!this._showing) {
            return Promise.resolve();
        }
        this._showing = false;

        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._adUnit.close().then(() => {
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

    private unsetReferences() {
        delete this._overlay;
    }

    private hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.container().parentElement!.removeChild(overlay.container());
        }
    };

    private getVideoUrl(): string {
        const campaign: Campaign = this.getCampaign();
        if(!campaign.isVideoCached() && campaign.getStreamingVideoUrl()) {
            return campaign.getStreamingVideoUrl();
        } else {
            return campaign.getVideoUrl();
        }
    }

    private onShow() {
        if(this._showing && this.isVideoActive()) {
            if(this._nativeBridge.getPlatform() === Platform.IOS && IosUtils.hasVideoStallingApi(this._deviceInfo.getOsVersion())) {
                if(this.getCampaign().isVideoCached()) {
                    this._nativeBridge.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(false);
                } else {
                    this._nativeBridge.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(true);
                }
            }

            this._nativeBridge.VideoPlayer.prepare(this.getVideoUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
        }
    }

    private onSystemKill() {
        if(this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onSystemPause(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.Sdk.logInfo('Pausing Unity Ads video playback after interrupt');
            this._nativeBridge.VideoPlayer.pause();
        }
    }

    private onSystemInterrupt(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
            if(!this._adUnit.isPaused()) {
                this._nativeBridge.VideoPlayer.play();
            }
        }
    }
}
