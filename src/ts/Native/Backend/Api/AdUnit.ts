import { Backend } from 'Native/Backend/Backend';

export class AdUnit {

    public static open(activityId: number, views: string[], orientation: number, keyEvents: string[], systemUiVisibility: number, hardwareAcceleration: boolean) {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        let webView = <HTMLIFrameElement>window.parent.document.getElementById('webView');

        videoView.style.display = 'block';
        webView.style.display = 'block';

        setTimeout(() => {
            Backend.sendEvent('ADUNIT', 'ON_CREATE', activityId);
            Backend.sendEvent('ADUNIT', 'ON_START', activityId);
            Backend.sendEvent('ADUNIT', 'ON_RESUME', activityId);
        }, 0);

        return [];
    }

    public static close() {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        let webView = <HTMLIFrameElement>window.parent.document.getElementById('webView');

        videoView.style.display = 'none';
        webView.style.display = 'none';
    }

    public static setViews(views: string[]) {

    }

    public static setOrientation(orientation: number) {

    }

}