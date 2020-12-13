import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Rotation } from 'Core/Constants/Android/Rotation';
import { ScreenOrientation } from 'Core/Constants/Android/ScreenOrientation';
import { PausableListenerApi } from 'Ads/Native/PausableListener';
export class Activity extends AdUnitContainer {
    constructor(core, ads, deviceInfo) {
        super();
        this._core = core;
        this._ads = ads;
        this._deviceInfo = deviceInfo;
        this._activityId = 0;
        this._currentActivityFinished = false;
        this._onResumeObserver = this._ads.Android.AdUnit.onResume.subscribe((activityId) => this.onResume(activityId));
        this._onPauseObserver = this._ads.Android.AdUnit.onPause.subscribe((finishing, activityId) => this.onPause(finishing, activityId));
        this._onDestroyObserver = this._ads.Android.AdUnit.onDestroy.subscribe((finishing, activityId) => this.onDestroy(finishing, activityId));
        this._onCreateObserver = this._ads.Android.AdUnit.onCreate.subscribe((activityId) => this.onCreate(activityId));
        this._onRestoreObserver = this._ads.Android.AdUnit.onRestore.subscribe((activityId) => this.onRestore(activityId));
    }
    open(adUnit, views, allowRotation, forceOrientation, disableBackbutton, isTransparent, withAnimation, allowStatusBar, options) {
        this._activityId++;
        this._currentActivityFinished = false;
        this._androidOptions = options;
        let nativeViews = views;
        if (nativeViews.length === 0) {
            nativeViews = ['webview'];
        }
        const forcedOrientation = AdUnitContainer.getForcedOrientation();
        if (forcedOrientation) {
            this._lockedOrientation = forcedOrientation;
        }
        else {
            this._lockedOrientation = forceOrientation;
        }
        let keyEvents = [];
        if (disableBackbutton) {
            keyEvents = [4 /* BACK */];
        }
        const hardwareAccel = this.isHardwareAccelerationAllowed();
        this._core.Sdk.logInfo('Opening ' + adUnit.description() + ' ad unit with orientation ' + Orientation[this._lockedOrientation] + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));
        this._onFocusGainedObserver = this._ads.Android.AdUnit.onFocusGained.subscribe(() => this.onFocusGained());
        this._onFocusLostObserver = this._ads.Android.AdUnit.onFocusLost.subscribe(() => this.onFocusLost());
        return this._ads.Android.AdUnit.open(this._activityId, nativeViews, this.getOrientation(allowRotation, this._lockedOrientation, options), keyEvents, 1 /* LOW_PROFILE */, hardwareAccel, isTransparent).catch(error => {
            // if opening transparent activity fails, cleanly fall back to non-transparent activity
            // this may happen if developer is missing transparent activity in app Android manifest
            if (isTransparent) {
                return this._ads.Android.AdUnit.open(this._activityId, nativeViews, this.getOrientation(allowRotation, this._lockedOrientation, options), keyEvents, 1 /* LOW_PROFILE */, hardwareAccel, false);
            }
            throw error;
        });
    }
    close() {
        if (!this._currentActivityFinished) {
            this._currentActivityFinished = true;
            this._ads.Android.AdUnit.onFocusLost.unsubscribe(this._onFocusLostObserver);
            this._ads.Android.AdUnit.onFocusGained.unsubscribe(this._onFocusGainedObserver);
            return this._ads.Android.AdUnit.close();
        }
        else {
            return Promise.resolve();
        }
    }
    reconfigure(configuration) {
        const promises = [];
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            switch (configuration) {
                case 0 /* ENDSCREEN */:
                    promises.push(this._ads.Android.AdUnit.setViews(['webview']));
                    promises.push(this._ads.Android.AdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR));
                    break;
                case 1 /* LANDSCAPE_VIDEO */:
                    promises.push(this._ads.Android.AdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE));
                    promises.push(this._ads.Android.AdUnit.setViewFrame('videoplayer', 0, 0, screenHeight, screenWidth));
                    break;
                case 2 /* WEB_PLAYER */:
                    promises.push(this._ads.Android.AdUnit.setViews(['webplayer', 'webview']));
                    promises.push(this._ads.Android.AdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR));
                    break;
                default:
            }
            return Promise.all(promises);
        });
    }
    reorient(allowRotation, forceOrientation) {
        return this._ads.Android.AdUnit.setOrientation(this.getOrientation(allowRotation, forceOrientation, this._androidOptions));
    }
    isPaused() {
        return this._paused;
    }
    setViewFrame(view, x, y, width, height) {
        return this._ads.Android.AdUnit.setViewFrame(view, x, y, width, height);
    }
    getViews() {
        return this._ads.Android.AdUnit.getViews();
    }
    getOrientation(allowRotation, forceOrientation, options) {
        let orientation = ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR;
        if (allowRotation) {
            if (forceOrientation === Orientation.PORTRAIT) {
                if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
                }
                else if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_REVERSE_PORTRAIT) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
                }
                else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_0) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
                }
                else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_180) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
                }
                else {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
                }
            }
            else if (forceOrientation === Orientation.LANDSCAPE) {
                if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
                }
                else if (options.requestedOrientation === ScreenOrientation.SCREEN_ORIENTATION_REVERSE_LANDSCAPE) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
                }
                else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_90) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
                }
                else if (options.display && this.getNaturalRotation(options.display) === Rotation.ROTATION_270) {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
                }
                else {
                    orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
                }
            }
        }
        else {
            if (forceOrientation === Orientation.PORTRAIT) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_PORTRAIT;
            }
            else if (forceOrientation === Orientation.LANDSCAPE) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE;
            }
            else {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_LOCKED;
            }
        }
        return orientation;
    }
    onCreate(activityId) {
        this._paused = false;
        if (activityId === this._activityId) {
            this._handlers.forEach(handler => handler.onContainerShow());
        }
    }
    onRestore(activityId) {
        this._paused = false;
        if (activityId === this._activityId) {
            this._handlers.forEach(handler => handler.onContainerShow());
        }
    }
    onResume(activityId) {
        this._paused = false;
        if (activityId === this._activityId) {
            this._handlers.forEach(handler => handler.onContainerForeground());
        }
    }
    onPause(finishing, activityId) {
        this._paused = true;
        this._handlers.forEach(handler => handler.onContainerBackground());
        if (finishing && activityId === this._activityId) {
            if (!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this._handlers.forEach(handler => handler.onContainerDestroy());
            }
        }
    }
    onDestroy(finishing, activityId) {
        if (finishing && activityId === this._activityId) {
            if (!this._currentActivityFinished) {
                this._currentActivityFinished = true;
                this._handlers.forEach(handler => handler.onContainerDestroy());
            }
        }
        if (this._ads.Listener instanceof PausableListenerApi) {
            this._ads.Listener.resumeEvents();
        }
    }
    onFocusGained() {
        this._paused = false;
        this._handlers.forEach(handler => handler.onContainerForeground());
    }
    onFocusLost() {
        this._paused = true;
        this._handlers.forEach(handler => handler.onContainerBackground());
    }
    isHardwareAccelerationAllowed() {
        if (this._deviceInfo.getApiLevel() < 18) {
            // hardware acceleration does not work reliably on Android 4.0 and 4.1
            // since there have been at least two reports from Android 4.2 devices being broken, it's also disabled on Android 4.2
            return false;
        }
        return true;
    }
    getNaturalRotation(display) {
        switch (display.rotation) {
            case Rotation.ROTATION_0:
                if (display.width > display.height) {
                    // the natural orientation (Rotation_0) is landscape on some Android tablets
                    return Rotation.ROTATION_90;
                }
                return Rotation.ROTATION_0;
            case Rotation.ROTATION_90:
                if (display.width < display.height) {
                    return Rotation.ROTATION_180;
                }
                return Rotation.ROTATION_90;
            case Rotation.ROTATION_180:
                if (display.width > display.height) {
                    return Rotation.ROTATION_270;
                }
                return Rotation.ROTATION_180;
            case Rotation.ROTATION_270:
                if (display.width < display.height) {
                    return Rotation.ROTATION_180;
                }
                return Rotation.ROTATION_270;
            default:
                return display.rotation;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aXZpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvQ29udGFpbmVycy9BY3Rpdml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFXLFdBQVcsRUFBcUIsTUFBTSx3Q0FBd0MsQ0FBQztBQUdsSCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFLN0UsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFhbEUsTUFBTSxPQUFPLFFBQVMsU0FBUSxlQUFlO0lBb0J6QyxZQUFZLElBQWMsRUFBRSxHQUFZLEVBQUUsVUFBNkI7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUU5QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO1FBRXRDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2pILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDcEksSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMxSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUN4SCxDQUFDO0lBRU0sSUFBSSxDQUFDLE1BQWUsRUFBRSxLQUFlLEVBQUUsYUFBc0IsRUFBRSxnQkFBNkIsRUFBRSxpQkFBMEIsRUFBRSxhQUFzQixFQUFFLGFBQXNCLEVBQUUsY0FBdUIsRUFBRSxPQUF3QjtRQUM5TixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztRQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztRQUUvQixJQUFJLFdBQVcsR0FBYSxLQUFLLENBQUM7UUFDbEMsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxQixXQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM3QjtRQUVELE1BQU0saUJBQWlCLEdBQUcsZUFBZSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDakUsSUFBSSxpQkFBaUIsRUFBRTtZQUNuQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7U0FDL0M7YUFBTTtZQUNILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQztTQUM5QztRQUVELElBQUksU0FBUyxHQUFjLEVBQUUsQ0FBQztRQUM5QixJQUFJLGlCQUFpQixFQUFFO1lBQ25CLFNBQVMsR0FBRyxjQUFjLENBQUM7U0FDOUI7UUFFRCxNQUFNLGFBQWEsR0FBWSxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUNwRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyw0QkFBNEIsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsMEJBQTBCLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUV4TSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDNUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRXRHLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEVBQUUsU0FBUyx1QkFBa0MsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM5Tix1RkFBdUY7WUFDdkYsdUZBQXVGO1lBQ3ZGLElBQUksYUFBYSxFQUFFO2dCQUNmLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEVBQUUsU0FBUyx1QkFBa0MsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQy9NO1lBRUQsTUFBTSxLQUFLLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFDaEMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNqRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUM1QzthQUFNO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7SUFDTCxDQUFDO0lBRU0sV0FBVyxDQUFDLGFBQWdDO1FBQy9DLE1BQU0sUUFBUSxHQUF1QixFQUFFLENBQUM7UUFFeEMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUU7U0FDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUU7WUFDcEMsUUFBUSxhQUFhLEVBQUU7Z0JBQ25CO29CQUNJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0QsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztvQkFDMUcsTUFBTTtnQkFFVjtvQkFDSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO29CQUN4RyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ3RHLE1BQU07Z0JBQ1Y7b0JBQ0ksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztvQkFFMUcsTUFBTTtnQkFDVixRQUFRO2FBQ1g7WUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sUUFBUSxDQUFDLGFBQXNCLEVBQUUsZ0JBQTZCO1FBQ2pFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUNoSSxDQUFDO0lBRU0sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRU0sWUFBWSxDQUFDLElBQVksRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQ2pGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRU8sY0FBYyxDQUFDLGFBQXNCLEVBQUUsZ0JBQTZCLEVBQUUsT0FBd0I7UUFDbEcsSUFBSSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsOEJBQThCLENBQUM7UUFDbkUsSUFBSSxhQUFhLEVBQUU7WUFDZixJQUFJLGdCQUFnQixLQUFLLFdBQVcsQ0FBQyxRQUFRLEVBQUU7Z0JBQzNDLElBQUksT0FBTyxDQUFDLG9CQUFvQixLQUFLLGlCQUFpQixDQUFDLDJCQUEyQixFQUFFO29CQUNoRixXQUFXLEdBQUcsaUJBQWlCLENBQUMsMkJBQTJCLENBQUM7aUJBQy9EO3FCQUFNLElBQUksT0FBTyxDQUFDLG9CQUFvQixLQUFLLGlCQUFpQixDQUFDLG1DQUFtQyxFQUFFO29CQUMvRixXQUFXLEdBQUcsaUJBQWlCLENBQUMsbUNBQW1DLENBQUM7aUJBQ3ZFO3FCQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxVQUFVLEVBQUU7b0JBQzVGLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQywyQkFBMkIsQ0FBQztpQkFDL0Q7cUJBQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLFlBQVksRUFBRTtvQkFDOUYsV0FBVyxHQUFHLGlCQUFpQixDQUFDLG1DQUFtQyxDQUFDO2lCQUN2RTtxQkFBTTtvQkFDSCxXQUFXLEdBQUcsaUJBQWlCLENBQUMsa0NBQWtDLENBQUM7aUJBQ3RFO2FBQ0o7aUJBQU0sSUFBSSxnQkFBZ0IsS0FBSyxXQUFXLENBQUMsU0FBUyxFQUFFO2dCQUNuRCxJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsS0FBSyxpQkFBaUIsQ0FBQyw0QkFBNEIsRUFBRTtvQkFDakYsV0FBVyxHQUFHLGlCQUFpQixDQUFDLDRCQUE0QixDQUFDO2lCQUNoRTtxQkFBTSxJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsS0FBSyxpQkFBaUIsQ0FBQyxvQ0FBb0MsRUFBRTtvQkFDaEcsV0FBVyxHQUFHLGlCQUFpQixDQUFDLG9DQUFvQyxDQUFDO2lCQUN4RTtxQkFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsV0FBVyxFQUFFO29CQUM3RixXQUFXLEdBQUcsaUJBQWlCLENBQUMsNEJBQTRCLENBQUM7aUJBQ2hFO3FCQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxZQUFZLEVBQUU7b0JBQzlGLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxvQ0FBb0MsQ0FBQztpQkFDeEU7cUJBQU07b0JBQ0gsV0FBVyxHQUFHLGlCQUFpQixDQUFDLG1DQUFtQyxDQUFDO2lCQUN2RTthQUNKO1NBQ0o7YUFBTTtZQUNILElBQUksZ0JBQWdCLEtBQUssV0FBVyxDQUFDLFFBQVEsRUFBRTtnQkFDM0MsV0FBVyxHQUFHLGlCQUFpQixDQUFDLDJCQUEyQixDQUFDO2FBQy9EO2lCQUFNLElBQUksZ0JBQWdCLEtBQUssV0FBVyxDQUFDLFNBQVMsRUFBRTtnQkFDbkQsV0FBVyxHQUFHLGlCQUFpQixDQUFDLDRCQUE0QixDQUFDO2FBQ2hFO2lCQUFNO2dCQUNILFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQzthQUM3RDtTQUNKO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVPLFFBQVEsQ0FBQyxVQUFrQjtRQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7U0FDaEU7SUFDTCxDQUFDO0lBRU8sU0FBUyxDQUFDLFVBQWtCO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztTQUNoRTtJQUNMLENBQUM7SUFFTyxRQUFRLENBQUMsVUFBa0I7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7U0FDdEU7SUFDTCxDQUFDO0lBRU8sT0FBTyxDQUFDLFNBQWtCLEVBQUUsVUFBa0I7UUFDbEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLElBQUksU0FBUyxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQzthQUNuRTtTQUNKO0lBQ0wsQ0FBQztJQUVPLFNBQVMsQ0FBQyxTQUFrQixFQUFFLFVBQWtCO1FBQ3BELElBQUksU0FBUyxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQzthQUNuRTtTQUNKO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsWUFBWSxtQkFBbUIsRUFBRTtZQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNyQztJQUNMLENBQUM7SUFFTyxhQUFhO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRU8sV0FBVztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRU8sNkJBQTZCO1FBQ2pDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDckMsc0VBQXNFO1lBQ3RFLHNIQUFzSDtZQUN0SCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxPQUFpQjtRQUN4QyxRQUFRLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDdEIsS0FBSyxRQUFRLENBQUMsVUFBVTtnQkFDcEIsSUFBSSxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQ2hDLDRFQUE0RTtvQkFDNUUsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDO2lCQUMvQjtnQkFDRCxPQUFPLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDL0IsS0FBSyxRQUFRLENBQUMsV0FBVztnQkFDckIsSUFBSSxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQ2hDLE9BQU8sUUFBUSxDQUFDLFlBQVksQ0FBQztpQkFDaEM7Z0JBQ0QsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQ2hDLEtBQUssUUFBUSxDQUFDLFlBQVk7Z0JBQ3RCLElBQUksT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUNoQyxPQUFPLFFBQVEsQ0FBQyxZQUFZLENBQUM7aUJBQ2hDO2dCQUNELE9BQU8sUUFBUSxDQUFDLFlBQVksQ0FBQztZQUNqQyxLQUFLLFFBQVEsQ0FBQyxZQUFZO2dCQUN0QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtvQkFDaEMsT0FBTyxRQUFRLENBQUMsWUFBWSxDQUFDO2lCQUNoQztnQkFDRCxPQUFPLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFDakM7Z0JBQ0ksT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDO1NBQy9CO0lBQ0wsQ0FBQztDQUNKIn0=