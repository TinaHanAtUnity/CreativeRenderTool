import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Observable0 } from 'Utilities/Observable';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Double } from 'Utilities/Double';
import { Video } from 'Models/Video';

export abstract class VideoAdUnit extends AbstractAdUnit {

    private static _progressInterval: number = 250;

    public onVideoStart: Observable0 = new Observable0();
    public onVideoFinish: Observable0 = new Observable0();
    public onVideoClose: Observable0 = new Observable0();
    public onVideoError: Observable0 = new Observable0();

    private _finishState: FinishState;

    private _video: Video;
    private _overlay: AbstractVideoOverlay | undefined;
    private _options: any;

    private _onShowObserver: any;
    private _onSystemKillObserver: any;
    private _onSystemInterruptObserver: any;

    private _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: Campaign, video: Video, overlay: AbstractVideoOverlay, options: any) {
        super(nativeBridge, container, placement, campaign);

        this._container = container;
        this._video = video;
        this._overlay = overlay;
        this._options = options;

        this.onVideoClose.subscribe(() => this.onClose.trigger());
        this.onVideoFinish.subscribe(() => this.onFinish.trigger());
        this.onVideoStart.subscribe(() => this.onStart.trigger());
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this._video.setActive(true);

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

    public getVideo(): Video {
        return this._video;
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

    private onShow() {
        if(this._showing && this._video.isActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getVideo().getUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
        }
    }

    private onSystemKill() {
        if(this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onSystemInterrupt(): void {
        if(this._showing && this._video.isActive()) {
            this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
            this._nativeBridge.VideoPlayer.play();
        }
    }

}
