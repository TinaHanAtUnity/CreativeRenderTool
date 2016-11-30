import { AdUnit } from 'Utilities/AdUnit';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';

export class AndroidAdUnit extends AdUnit {
    private _activityId: number = 1;

    public open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: any): Promise<void> {
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

        return this._nativeBridge.AndroidAdUnit.open(this._activityId++, views, orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
    }

    public close(): Promise<void> {
        return Promise.resolve();
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