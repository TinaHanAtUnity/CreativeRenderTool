import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { FinishState } from 'Constants/FinishState';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { AndroidVideoPlayerError } from 'Native/Api/AndroidVideoPlayer';
import { AdUnit } from 'Utilities/AdUnit';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
}

export class AndroidVideoAdUnitController extends VideoAdUnitController {
    private _onShowObserver: any;
    private _onSystemKillObserver: any;

    private _adUnit: AdUnit;
    private _androidOptions: IAndroidOptions;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, placement: Placement, campaign: Campaign, overlay: Overlay, options: any) {
        super(nativeBridge, placement, campaign, overlay);

        this._adUnit = adUnit;
        this._androidOptions = options;
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this.setVideoActive(true);

        this._onShowObserver = this._adUnit.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._adUnit.onSystemKill.subscribe(() => this.onSystemKill());

        return this._adUnit.open('video', true, !this._placement.useDeviceOrientationForVideo(), this._placement.disableBackButton(), this._androidOptions);
    }

    public hide(): Promise<void> {
        if(!this._showing) {
            return Promise.resolve();
        }
        this._showing = false;

        this._adUnit.onShow.unsubscribe(this._onShowObserver);
        this._adUnit.onSystemKill.unsubscribe(this._onSystemKillObserver);

        if(this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.stop().catch(error => {
                if(error === AndroidVideoPlayerError[AndroidVideoPlayerError.VIDEOVIEW_NULL]) {
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
}
