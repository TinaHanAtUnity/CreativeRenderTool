import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { FinishState } from 'Constants/FinishState';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';
import { AndroidAdUnitError } from 'Native/Api/AndroidAdUnit';
import { AndroidVideoPlayerError } from 'Native/Api/AndroidVideoPlayer';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
}

export class AndroidVideoAdUnit extends VideoAdUnit {
    private static _activityIdCounter: number = 1;

    private _activityId: number;

    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;
    private _onBackKeyObserver: any;

    private _androidOptions: IAndroidOptions;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay) {
        super(nativeBridge, placement, campaign, overlay);

        this._activityId = AndroidVideoAdUnit._activityIdCounter++;

        this._onResumeObserver = this._nativeBridge.AndroidAdUnit.onResume.subscribe((activityId) => this.onResume(activityId));
        this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing, activityId) => this.onPause(finishing, activityId));
        this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing, activityId) => this.onDestroy(finishing, activityId));
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onStart.trigger();
        this.setVideoActive(true);

        let orientation: ScreenOrientation = this._androidOptions.requestedOrientation;
        if (!this._placement.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];


        let hardwareAccel: boolean = true;

        if(this._nativeBridge.getApiLevel() < 17) {
            hardwareAccel = false;
        }

        this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

        return this._nativeBridge.AndroidAdUnit.open(this._activityId, ['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && !this.isVideoActive()) {
            this.hide();
        }
    }

    public hide(): Promise<void> {
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

        this._nativeBridge.AndroidAdUnit.onResume.unsubscribe(this._onResumeObserver);
        this._nativeBridge.AndroidAdUnit.onPause.unsubscribe(this._onPauseObserver);
        this._nativeBridge.AndroidAdUnit.onDestroy.unsubscribe(this._onDestroyObserver);
        this._nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(this._onBackKeyObserver);

        return this._nativeBridge.AndroidAdUnit.close().then(() => {
            this._showing = false;
            this.onClose.trigger();
        }).catch(error => {
            // activity might be null here if we are coming from onDestroy observer so just cleanly ignore the error
            if(error === AndroidAdUnitError[AndroidAdUnitError.ACTIVITY_NULL]) {
                this._showing = false;
                this.onClose.trigger();
            } else {
                throw new Error(error);
            }
        });
    }

    public setNativeOptions(options: any): void {
        this._androidOptions = options;
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(activityId: number): void {
        if(this._showing && this.isVideoActive() && activityId === this._activityId) {
            this._nativeBridge.VideoPlayer.prepare(this._campaign.getVideoUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0));
        }
    }

    private onPause(finishing: boolean, activityId: number): void {
        if(finishing && this._showing && activityId === this._activityId) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onDestroy(finishing: boolean, activityId: number): void {
        if(this._showing && finishing && activityId === this._activityId) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }
}
