import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AdUnitContainer, ForceOrientation} from 'AdUnits/Containers/AdUnitContainer';
import { Double } from 'Utilities/Double';
import { Video } from 'Models/Video';
import { Overlay } from 'Views/Overlay';

export abstract class VideoAdUnit extends AbstractAdUnit {

    private static _progressInterval: number = 250;

    protected _onShowObserver: any;
    protected _onSystemKillObserver: any;
    protected _onSystemInterruptObserver: any;

    protected _options: any;
    private _video: Video;
    private _overlay: Overlay | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: Campaign, video: Video, overlay: Overlay, options: any) {
        super(nativeBridge, container, placement, campaign);

        this._video = video;
        this._overlay = overlay;
        this._options = options;
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this._video.setActive(true);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe(() => this.onSystemInterrupt());

        return this._container.open(this, true, true, this._placement.useDeviceOrientationForVideo() ? ForceOrientation.NONE : ForceOrientation.LANDSCAPE, this._placement.disableBackButton(), this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public getOverlay(): Overlay | undefined {
        return this._overlay;
    }

    public getProgressInterval(): number {
        return VideoAdUnit._progressInterval;
    }

    public getVideo(): Video {
        return this._video;
    }

    protected unsetReferences() {
        delete this._overlay;
    }

    protected onShow() {
        if(this.isShowing() && this._video.isActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getVideo().getUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
        }
    }

    protected onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    protected onSystemInterrupt(): void {
        if(this.isShowing() && this._video.isActive()) {
            this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
            this._nativeBridge.VideoPlayer.play();
        }
    }

    protected hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.container().parentElement!.removeChild(overlay.container());
        }
    };

}
