import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Rotation } from 'Constants/Android/Rotation';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
    display?: IDisplay;
}

interface IDisplay {
    rotation: Rotation;
    width: number;
    height: number;
}

export class Activity extends AdUnitContainer {

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;

    private _activityId: number;
    private _currentActivityFinished: boolean;

    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;

    private _androidOptions: IAndroidOptions;

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

    public open(adUnit: AbstractAdUnit, videoplayer: boolean, allowRotation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: IAndroidOptions): Promise<void> {
        this._activityId++;
        this._currentActivityFinished = false;
        this._androidOptions = options;

        let views: string[] = ['webview'];
        if(videoplayer) {
            views = ['videoplayer', 'webview'];
        }

        let orientation = this.getOrientation(allowRotation, forceOrientation, options);

        let keyEvents: any[] = [];
        if(disableBackbutton) {
            keyEvents = [KeyCode.BACK];
        }

        const hardwareAccel: boolean = this.isHardwareAccelerationAllowed();

        const forcedOrientation = AdUnitContainer.getForcedOrientation();
        if (forcedOrientation) {
            orientation = forcedOrientation;
        }

        this._nativeBridge.Sdk.logInfo('Opening ' + adUnit.description() + ' ad unit with orientation ' + orientation + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

        return this._nativeBridge.AndroidAdUnit.open(this._activityId, views, orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel, isTransparent);
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
        return this._nativeBridge.AndroidAdUnit.setOrientation(this.getOrientation(allowRotation, forceOrientation, this._androidOptions));
    }

    public isPaused() {
        return false;
    }

    private getOrientation(allowRotation: boolean, forceOrientation: ForceOrientation, options: IAndroidOptions) {
        let orientation = ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR;
        if(allowRotation) {
            if(forceOrientation === ForceOrientation.PORTRAIT) {
                if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
                } else if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_REVERSE_PORTRAIT) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
                } else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_0) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
                } else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_180) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
                } else {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
                }
            } else if(forceOrientation === ForceOrientation.LANDSCAPE) {
                if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
                } else if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_REVERSE_LANDSCAPE) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
                } else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_90) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
                } else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_270) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
                } else {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
                }
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

    private getNaturalRotation(display: IDisplay): Rotation {
        switch (display.rotation) {
            case Rotation.ROTATION_0:
                if(display.width > display.height) {
                    // the natural orientation (Rotation_0) is landscape on some Android tablets
                    return Rotation.ROTATION_90;
                }
                return Rotation.ROTATION_0;
            case Rotation.ROTATION_90:
                if(display.width < display.height) {
                    return Rotation.ROTATION_180;
                }
                return Rotation.ROTATION_90;
            case Rotation.ROTATION_180:
                if(display.width > display.height) {
                    return Rotation.ROTATION_270;
                }
                return Rotation.ROTATION_180;
            case Rotation.ROTATION_270:
                if(display.width < display.height) {
                    return Rotation.ROTATION_180;
                }
                return Rotation.ROTATION_270;
            default:
                return display.rotation;
        }
    }
}
