import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { IosVideoPlayerEvent } from 'Native/Api/IosVideoPlayer';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { AdUnit } from 'Utilities/AdUnit';

interface IIosOptions {
    supportedOrientations: UIInterfaceOrientationMask;
    supportedOrientationsPlist: UIInterfaceOrientationMask;
    shouldAutorotate: boolean;
    statusBarOrientation: number;
}

export class IosVideoAdUnitController extends VideoAdUnitController {
    private _onShowObserver: any;
    private _onSystemInterruptObserver: any;

    private _adUnit: AdUnit;
    private _iosOptions: IIosOptions;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, placement: Placement, campaign: Campaign, overlay: Overlay, options: any) {
        super(nativeBridge, placement, campaign, overlay);

        this._adUnit = adUnit;
        this._iosOptions = options;
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this.setVideoActive(true);

        this._onShowObserver = this._adUnit.onShow.subscribe(() => this.onShow());
        this._onSystemInterruptObserver = this._adUnit.onSystemInterrupt.subscribe(() => this.onSystemInterrupt());

        return this._adUnit.open('video', true, !this._placement.useDeviceOrientationForVideo(), this._placement.disableBackButton(), this._iosOptions);
    }

    public hide(): Promise<void> {
        if(!this._showing) {
            return Promise.resolve();
        }
        this._showing = false;

        if(this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.stop().catch(error => {
                if(error === IosVideoPlayerEvent[IosVideoPlayerEvent.VIDEOVIEW_NULL]) {
                    // sometimes system has already destroyed video view so just ignore this error
                } else {
                    throw new Error(error);
                }
            });
        }
        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._adUnit.close().then(() => {
            this.onVideoClose.trigger();
        });
    }

    private onShow(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getVideoUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
        }
    }

    private onSystemInterrupt(): void {
        if(this._showing && this.isVideoActive()) {
            this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
            this._nativeBridge.VideoPlayer.play();
        }
    }
}
