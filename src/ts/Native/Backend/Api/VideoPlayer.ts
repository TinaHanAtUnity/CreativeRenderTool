import { Backend } from 'Native/Backend/Backend';

export class VideoPlayer {

    public static prepare(url: string) {
        if('exec' in window) {
            // tslint:disable:no-string-literal
            const exec = window['exec'];
            exec('curl -s "' + url + '" | exiftool -j -', (err: Error, stdout: string, stderr: string) => {
                const stream = JSON.parse(stdout)[0];
                const duration = VideoPlayer._duration = Math.round(parseFloat(stream.Duration) * 1000);
                const splitImageSize = stream.ImageSize.split('x');
                const width = VideoPlayer._width = splitImageSize[0];
                const height = VideoPlayer._height = splitImageSize[1];
                VideoPlayer._url = url;
                Backend.sendEvent('VIDEOPLAYER', 'PREPARED', duration, width, height, url);
            });
            // tslint:enable:no-string-literal
        } else {
            let videoView = VideoPlayer._videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
            if(!videoView) {
                videoView = document.createElement('video');
            }
            videoView.addEventListener('canplay', () => {
                VideoPlayer._url = url;
                const duration = VideoPlayer._duration = Math.round(videoView.duration * 1000);
                const width = VideoPlayer._width = videoView.videoWidth;
                const height = VideoPlayer._height = videoView.videoHeight;
                Backend.sendEvent('VIDEOPLAYER', 'PREPARED', duration, width, height, url);
            }, false);
            videoView.src = url;
        }
    }

    public static setVolume(volume: number) {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(!videoView) {
            videoView = VideoPlayer._videoView;
        }
        if(videoView) {
            videoView.volume = volume;
        }
    }

    public static play() {
        if(VideoPlayer._videoView) {
            const videoView = VideoPlayer._videoView;
            videoView.addEventListener('play', () => {
                Backend.sendEvent('VIDEOPLAYER', 'PLAY');
            }, false);
            videoView.addEventListener('timeupdate', () => {
                Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', Math.round(videoView.currentTime * 1000));
            }, false);
            videoView.addEventListener('ended', () => {
                Backend.sendEvent('VIDEOPLAYER', 'COMPLETED', VideoPlayer._url);
            }, false);
            videoView.play();
        } else {
            let currentTime = 0;
            Backend.sendEvent('VIDEOPLAYER', 'PLAY');
            VideoPlayer._progressTimer = setInterval(() => {
                currentTime += 250;
                if(currentTime >= VideoPlayer._duration) {
                    Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', VideoPlayer._duration);
                    setTimeout(() => {
                        Backend.sendEvent('VIDEOPLAYER', 'COMPLETED', VideoPlayer._url);
                    }, 0);
                    clearInterval(VideoPlayer._progressTimer);
                } else {
                    Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', currentTime);
                }
            }, 250);
        }
    }

    public static pause() {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(!videoView) {
            videoView = VideoPlayer._videoView;
        }
        if(videoView) {
            videoView.pause();
        }
        setTimeout(() => {
            Backend.sendEvent('VIDEOPLAYER', 'PAUSE', VideoPlayer._url);
            Backend.sendEvent('VIDEOPLAYER', 'STOP', VideoPlayer._url);
        }, 0);
    }

    private static _url: string | undefined;
    private static _duration: number | undefined;
    private static _width: number | undefined;
    private static _height: number | undefined;

    private static _videoView: HTMLVideoElement;
    private static _progressTimer: any;

}
