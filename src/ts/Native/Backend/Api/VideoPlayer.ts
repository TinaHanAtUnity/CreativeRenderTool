import { Backend } from 'Native/Backend/Backend';

export class VideoPlayer {

    private static _currentUrl: string | undefined;

    public static prepare(url: string) {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        videoView.addEventListener('canplay', () => {
            VideoPlayer._currentUrl = url;
            Backend.sendEvent('VIDEOPLAYER', 'PREPARED', Math.round(videoView.duration * 1000), videoView.videoWidth, videoView.videoHeight, url);
        }, false);
        videoView.src = url;
    }

    public static setVolume(volume: number) {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        videoView.volume = volume;
    }

    public static play() {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        videoView.addEventListener('timeupdate', () => {
            Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', Math.round(videoView.currentTime * 1000));
        }, false);
        videoView.play();
    }

    public static pause() {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        videoView.pause();
        setTimeout(() => {
            Backend.sendEvent('VIDEOPLAYER', 'PAUSE', VideoPlayer._currentUrl);
            Backend.sendEvent('VIDEOPLAYER', 'STOP', VideoPlayer._currentUrl);
        }, 0);
    }

}