import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
}

export class Activity extends AdUnitContainer {

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

    public open(adUnit: AbstractAdUnit, videoplayer: boolean, allowRotation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, options: IAndroidOptions): Promise<void> {
        this._activityId++;
        this._currentActivityFinished = false;

        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer', 'webview'];
        }

        const forcedOrientation = AdUnitContainer.getForcedOrientation();
        if (forcedOrientation) {
            this._lockedOrientation = forcedOrientation;
        } else {
            this._lockedOrientation = forceOrientation;
        }

        let keyEvents: any[] = [];
        if(disableBackbutton) {
            keyEvents = [KeyCode.BACK];
        }

        const hardwareAccel: boolean = this.isHardwareAccelerationAllowed();

        this._nativeBridge.Sdk.logInfo('Opening ' + adUnit.description() + ' ad unit with orientation ' + ForceOrientation[this._lockedOrientation] + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

        return this._nativeBridge.AndroidAdUnit.open(this._activityId, views, this.getOrientation(allowRotation, this._lockedOrientation), keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
    }

    public close(): Promise<void> {
        if(!this._currentActivityFinished) {
            this._currentActivityFinished = true;
            return this._nativeBridge.AndroidAdUnit.close();
        } else {
            return Promise.resolve();
        }
    }

    public reconfigure(configuration: ViewConfiguration): Promise<any[]> {
        const promises: Array<Promise<any>> = [];

        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            switch (configuration) {
                case ViewConfiguration.ENDSCREEN:
                    promises.push(this._nativeBridge.AndroidAdUnit.setViews(['webview']));
                    promises.push(this._nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR));
                    break;

                case ViewConfiguration.LANDSCAPE_VIDEO:
                    promises.push(this._nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE));
                    promises.push(this._nativeBridge.AndroidAdUnit.setViewFrame('videoplayer', 0, 0, screenHeight, screenWidth));
                    break;
                default:
                    break;
            }
            return Promise.all(promises);
        });
    }

    public reorient(allowRotation: boolean, forceOrientation: ForceOrientation): Promise<any> {
        return this._nativeBridge.AndroidAdUnit.setOrientation(this.getOrientation(allowRotation, forceOrientation));
    }

    public isPaused() {
        return false;
    }

    private getOrientation(allowRotation: boolean, forceOrientation: ForceOrientation) {
        let orientation = ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR;
        if(allowRotation) {
            if(forceOrientation === ForceOrientation.PORTRAIT) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
            } else if(forceOrientation === ForceOrientation.LANDSCAPE) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
            }
        } else {
            if(forceOrientation === ForceOrientation.PORTRAIT) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
            } else if(forceOrientation === ForceOrientation.LANDSCAPE) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
            } else {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_LOCKED;
            }
        }
        return orientation;
    }

    private onResume(activityId: number): void {
        if(activityId === this._activityId) {
            this.onShow.trigger();
        }
    }

    private onPause(finishing: boolean, activityId: number): void {
        this.onAndroidPause.trigger();
        if(finishing && activityId === this._activityId) {
            if(!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this.onSystemKill.trigger();
            }
        }
    }

    private onDestroy(finishing: boolean, activityId: number): void {
        if(finishing && activityId === this._activityId) {
            if(!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this.onSystemKill.trigger();
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
