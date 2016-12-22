import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { FinishState } from 'Constants/FinishState';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';
import { AndroidAdUnitError } from 'Native/Api/AndroidAdUnit';
import { AndroidVideoPlayerError } from 'Native/Api/AndroidVideoPlayer';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AdUnit } from 'Utilities/AdUnit';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
}

export class AndroidVideoAdUnitController extends VideoAdUnitController {
    public static ActivityId: number = 1;

    private _activityId: number;

    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;

    private _deviceInfo: DeviceInfo;
    private _androidOptions: IAndroidOptions;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, deviceInfo: DeviceInfo, placement: Placement, campaign: Campaign, overlay: Overlay, options: any) {
        super(nativeBridge, placement, campaign, overlay);

        this._deviceInfo = deviceInfo;
        this._androidOptions = options;

        this._activityId = AndroidVideoAdUnitController.ActivityId++;

        this._onResumeObserver = this._nativeBridge.AndroidAdUnit.onResume.subscribe((activityId) => this.onResume(activityId));
        this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing, activityId) => this.onPause(finishing, activityId));
        this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing, activityId) => this.onDestroy(finishing, activityId));
    }

    public show(): Promise<void> {
        this._showing = true;
        this.onVideoStart.trigger();
        this.setVideoActive(true);

        let orientation: ScreenOrientation = ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED;
        if(!this._placement.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(this._placement.disableBackButton()) {
            keyEvents = [KeyCode.BACK];
        }

        const hardwareAccel: boolean = this.isHardwareAccelerationAllowed();

        this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled') + ', playing from ' + this.getVideoUrl());

        return this._nativeBridge.AndroidAdUnit.open(this._activityId, ['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
    }

    public hide(): Promise<void> {
        if(!this._showing) {
            return Promise.resolve();
        }
        this._showing = false;

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

        return this._nativeBridge.AndroidAdUnit.close().then(() => {
            this.onVideoClose.trigger();
        }).catch(error => {
            // activity might be null here if we are coming from onDestroy observer so just cleanly ignore the error
            if(error === AndroidAdUnitError[AndroidAdUnitError.ACTIVITY_NULL]) {
                this.onVideoClose.trigger();
            } else {
                throw new Error(error);
            }
        });
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(activityId: number): void {
        if(this._showing && this.isVideoActive() && activityId === this._activityId) {
            this._nativeBridge.VideoPlayer.prepare(this.getVideoUrl(), new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
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

    private isHardwareAccelerationAllowed(): boolean {
        if(this._nativeBridge.getApiLevel() < 17) {
            // hardware acceleration does not work reliably before Android 4.2
            return false;
        }

        if(this._nativeBridge.getApiLevel() === 17 && this._deviceInfo.getModel() === 'DARKSIDE') {
            // specific device reported by GameLoft, ticket ABT-91
            return false;
        }

        return true;
    }
}
