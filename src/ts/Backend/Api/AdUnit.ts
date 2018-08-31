import { Backend } from 'Backend/Backend';
import { Platform } from 'Common/Constants/Platform';

export class AdUnit {

    public static open(activityId: number, views: string[], orientation: number, keyEvents: string[], systemUiVisibility: number, hardwareAcceleration: boolean) {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        const webView = <HTMLIFrameElement>window.parent.document.getElementById('webView');

        if(videoView) {
            videoView.style.display = 'block';
        }

        if(webView) {
            webView.style.display = 'block';
        }

        const platform = Backend.getPlatform();
        if(platform === Platform.ANDROID) {
            setTimeout(() => {
                Backend.sendEvent('ADUNIT', 'ON_CREATE', activityId);
                Backend.sendEvent('ADUNIT', 'ON_START', activityId);
                Backend.sendEvent('ADUNIT', 'ON_RESUME', activityId);
            }, 0);
        } else if(platform === Platform.IOS) {
            setTimeout(() => {
                Backend.sendEvent('ADUNIT', 'VIEW_CONTROLLER_DID_LOAD');
                Backend.sendEvent('ADUNIT', 'VIEW_CONTROLLER_INIT');
                Backend.sendEvent('ADUNIT', 'VIEW_CONTROLLER_DID_APPEAR');
            }, 0);
        }

        return [];
    }

    public static close() {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        const webView = <HTMLIFrameElement>window.parent.document.getElementById('webView');

        if(videoView) {
            videoView.style.display = 'none';
        }

        if(webView) {
            webView.style.display = 'none';
        }
    }

    public static setViews(views: string[]) {
        return;
    }

    public static setOrientation(orientation: number) {
        return;
    }

    public static setSupportedOrientations(orientations: number) {
        return;
    }

    public static setTransform(rotation: number) {
        return;
    }

    public static setViewFrame(view: string, x: number, y: number, width: number, height: number) {
        return;
    }

}
