import { BackendApi } from 'Backend/BackendApi';
import { Platform } from 'Core/Constants/Platform';

export class AdUnit extends BackendApi {

    public open(activityId: number, views: string[], orientation: number, keyEvents: string[], systemUiVisibility: number, hardwareAcceleration: boolean) {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        const webView = <HTMLIFrameElement>window.parent.document.getElementById('webView');

        if(videoView) {
            videoView.style.display = 'block';
        }

        if(webView) {
            webView.style.display = 'block';
        }

        const platform = this._backend.getPlatform();
        if(platform === Platform.ANDROID) {
            setTimeout(() => {
                this._backend.sendEvent('ADUNIT', 'ON_CREATE', activityId);
                this._backend.sendEvent('ADUNIT', 'ON_START', activityId);
                this._backend.sendEvent('ADUNIT', 'ON_RESUME', activityId);
            }, 0);
        } else if(platform === Platform.IOS) {
            setTimeout(() => {
                this._backend.sendEvent('ADUNIT', 'VIEW_CONTROLLER_DID_LOAD');
                this._backend.sendEvent('ADUNIT', 'VIEW_CONTROLLER_INIT');
                this._backend.sendEvent('ADUNIT', 'VIEW_CONTROLLER_DID_APPEAR');
            }, 0);
        }

        return [];
    }

    public close() {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        const webView = <HTMLIFrameElement>window.parent.document.getElementById('webView');

        if(videoView) {
            videoView.style.display = 'none';
        }

        if(webView) {
            webView.style.display = 'none';
        }
    }

    public setViews(views: string[]) {
        return;
    }

    public setOrientation(orientation: number) {
        return;
    }

    public setSupportedOrientations(orientations: number) {
        return;
    }

    public setTransform(rotation: number) {
        return;
    }

    public setViewFrame(view: string, x: number, y: number, width: number, height: number) {
        return;
    }

}
