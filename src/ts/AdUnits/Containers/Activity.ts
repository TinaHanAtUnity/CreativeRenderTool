import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, Orientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { KeyCode } from 'Constants/Android/KeyCode';
import { Rotation } from 'Constants/Android/Rotation';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { ForceQuitManager } from 'Managers/ForceQuitManager';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';

interface IAndroidOptions {
    requestedOrientation: ScreenOrientation;
    display: IDisplay;
}

interface IDisplay {
    rotation: Rotation;
    width: number;
    height: number;
}

export class Activity extends AdUnitContainer {

    private _nativeBridge: NativeBridge;
    private _deviceInfo: AndroidDeviceInfo;
    private _forceQuitManager: ForceQuitManager;

    private _activityId: number;
    private _currentActivityFinished: boolean;

    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;
    private _onCreateObserver: any;
    private _onRestoreObserver: any;

    private _onFocusGainedObserver: any;
    private _onFocusLostObserver: any;

    private _androidOptions: IAndroidOptions;

    constructor(nativeBridge: NativeBridge, deviceInfo: AndroidDeviceInfo, forceQuitManager: ForceQuitManager) {
        super();

        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
        this._forceQuitManager = forceQuitManager;

        this._activityId = 0;
        this._currentActivityFinished = false;

        this._onResumeObserver = this._nativeBridge.AndroidAdUnit.onResume.subscribe((activityId) => this.onResume(activityId));
        this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing, activityId) => this.onPause(finishing, activityId));
        this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing, activityId) => this.onDestroy(finishing, activityId));
        this._onCreateObserver = this._nativeBridge.AndroidAdUnit.onCreate.subscribe((activityId) => this.onCreate(activityId));
        this._onRestoreObserver = this._nativeBridge.AndroidAdUnit.onRestore.subscribe((activityId) => this.onRestore(activityId));
    }

    public open(adUnit: AbstractAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: IAndroidOptions): Promise<void> {
        this._activityId++;
        this._currentActivityFinished = false;
        this._androidOptions = options;

        let nativeViews: string[] = views;
        if(nativeViews.length === 0) {
            nativeViews = ['webview'];
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

        this._nativeBridge.Sdk.logInfo('Opening ' + adUnit.description() + ' ad unit with orientation ' + Orientation[this._lockedOrientation] + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

        this._onFocusGainedObserver = this._nativeBridge.AndroidAdUnit.onFocusGained.subscribe(() => this.onFocusGained());
        this._onFocusLostObserver = this._nativeBridge.AndroidAdUnit.onFocusLost.subscribe(() => this.onFocusLost());

        this._forceQuitManager.createForceQuitKey(adUnit.createForceQuitKey());

        return this._nativeBridge.AndroidAdUnit.open(this._activityId, nativeViews, this.getOrientation(allowRotation, this._lockedOrientation, options), keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel, isTransparent);
    }

    public close(): Promise<void> {
        if(!this._currentActivityFinished) {
            this._currentActivityFinished = true;
            this._nativeBridge.AndroidAdUnit.onFocusLost.unsubscribe(this._onFocusLostObserver);
            this._nativeBridge.AndroidAdUnit.onFocusGained.unsubscribe(this._onFocusGainedObserver);
            return this._nativeBridge.AndroidAdUnit.close().then(() => {
                this._forceQuitManager.destroyForceQuitKey();
            }).catch((e) => {
                const error = {
                    deviceInfo: this._deviceInfo
                };
                Diagnostics.trigger('android_close_error', error);
            });
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
                case ViewConfiguration.WEB_PLAYER:
                    promises.push(this._nativeBridge.AndroidAdUnit.setViews(['webplayer', 'webview']));
                    promises.push(this._nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR));

                    break;
                default:
            }
            return Promise.all(promises);
        });
    }

    public reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<any> {
        return this._nativeBridge.AndroidAdUnit.setOrientation(this.getOrientation(allowRotation, forceOrientation, this._androidOptions));
    }

    public isPaused() {
        return this._paused;
    }

    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return this._nativeBridge.AndroidAdUnit.setViewFrame(view, x, y, width, height);
    }

    public getViews(): Promise<string[]> {
        return this._nativeBridge.AndroidAdUnit.getViews();
    }

    private getOrientation(allowRotation: boolean, forceOrientation: Orientation, options: IAndroidOptions) {
        let orientation = ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR;
        if(allowRotation) {
            if(forceOrientation === Orientation.PORTRAIT) {
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
            } else if(forceOrientation === Orientation.LANDSCAPE) {
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
            if(forceOrientation === Orientation.PORTRAIT) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
            } else if(forceOrientation === Orientation.LANDSCAPE) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
            } else {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_LOCKED;
            }
        }
        return orientation;
    }

    private onCreate(activityId: number): void {
        this._paused = false;
        if(activityId === this._activityId) {
            this._handlers.forEach(handler => handler.onContainerShow());
        }
    }

    private onRestore(activityId: number): void {
        this._paused = false;
        if(activityId === this._activityId) {
            this._handlers.forEach(handler => handler.onContainerShow());
        }
    }

    private onResume(activityId: number): void {
        this._paused = false;
        if(activityId === this._activityId) {
            this._handlers.forEach(handler => handler.onContainerForeground());
        }
    }

    private onPause(finishing: boolean, activityId: number): void {
        this._paused = true;
        this._handlers.forEach(handler => handler.onContainerBackground());
        if(finishing && activityId === this._activityId) {
            if(!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this._handlers.forEach(handler => handler.onContainerDestroy());
            }
        }
    }

    private onDestroy(finishing: boolean, activityId: number): void {
        if(finishing && activityId === this._activityId) {
            if(!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this._handlers.forEach(handler => handler.onContainerDestroy());
            }
        }
    }

    private onFocusGained(): void {
        this._paused = false;
        this._handlers.forEach(handler => handler.onContainerForeground());
    }

    private onFocusLost(): void {
        this._paused = true;
        this._handlers.forEach(handler => handler.onContainerBackground());
    }

    private isHardwareAccelerationAllowed(): boolean {
        if(this._nativeBridge.getApiLevel() < 18) {
            // hardware acceleration does not work reliably on Android 4.0 and 4.1
            // since there have been at least two reports from Android 4.2 devices being broken, it's also disabled on Android 4.2
            return false;
        }

        return true;
    }

    private getNaturalRotation(display: IDisplay): Rotation {
        switch(display.rotation) {
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
