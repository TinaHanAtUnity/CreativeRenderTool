import { AdUnit } from 'Utilities/AdUnit';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';

export class AndroidAdUnit extends AdUnit {
    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;

    private _activityId: number;
    private _currentActivityFinished: boolean;

    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        super();

        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;

        this._activityId = 0;
        this._currentActivityFinished = false;

        this._onResumeObserver = this._nativeBridge.AndroidAdUnit.onResume.subscribe((activityId) => this.onResume(activityId));
        this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing, activityId) => this.onPause(finishing, activityId));
        this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing, activityId) => this.onDestroy(finishing, activityId));
    }

    public open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: any): Promise<void> {
        this._activityId++;
        this._currentActivityFinished = false;

        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer','webview'];
        }

        let orientation: ScreenOrientation = ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED;
        if(forceLandscape) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(disableBackbutton) {
            keyEvents = [KeyCode.BACK];
        }

        const hardwareAccel: boolean = this.isHardwareAccelerationAllowed();

        return this._nativeBridge.AndroidAdUnit.open(this._activityId, views, orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
    }

    public close(): Promise<void> {
        return this._nativeBridge.AndroidAdUnit.close();
    }

    private onResume(activityId: number): void {
        if(activityId === this._activityId) {
            this.onShow.trigger();
        }
    }

    private onPause(finishing: boolean, activityId: number): void {
        if(activityId === this._activityId) {
            this.onHide.trigger();

            if(!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this.onKill.trigger();
            }
        }
    }

    private onDestroy(finishing: boolean, activityId: number): void {
        if(activityId === this._activityId) {
            if(!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this.onKill.trigger();
            }
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