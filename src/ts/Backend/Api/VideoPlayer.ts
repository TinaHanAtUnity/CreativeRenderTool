import { Backend } from 'Backend/Backend';

export class VideoPlayer {

    public static setProgressEventInterval(milliseconds: number) {
        return;
    }

    public static prepare(url: string) {
        let _url = url;
        if(_url.indexOf('file://http') !== -1) {
            _url = _url.replace('file://', '');
        }

        if('exec' in window) {
            // tslint:disable:no-string-literal
            const exec = (<any>window)['exec'];
            exec('curl -s "' + _url + '" | exiftool -j -').then((result: any) => {
                const stdout: string = result.stdout;
                const stream = JSON.parse(stdout)[0];
                const duration = VideoPlayer._duration = Math.round(parseFloat(stream.Duration) * 1000);
                const splitImageSize = stream.ImageSize.split('x');
                const width = VideoPlayer._width = splitImageSize[0];
                const height = VideoPlayer._height = splitImageSize[1];
                VideoPlayer._url = _url;
                Backend.sendEvent('VIDEOPLAYER', 'PREPARED', _url, duration, width, height);
            });
            // tslint:enable:no-string-literal
        } else {
            let videoView = VideoPlayer._videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
            if(!videoView) {
                videoView = VideoPlayer._videoView = document.createElement('video');
            }
            videoView.addEventListener('canplay', () => {
                VideoPlayer._url = _url;
                const duration = VideoPlayer._duration = Math.round(videoView.duration * 1000);
                const width = VideoPlayer._width = videoView.videoWidth;
                const height = VideoPlayer._height = videoView.videoHeight;
                Backend.sendEvent('VIDEOPLAYER', 'PREPARED', _url, duration, width, height);
            }, false);
            videoView.src = _url;
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
                Backend.sendEvent('VIDEOPLAYER', 'PLAY', VideoPlayer._url);
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
                if(VideoPlayer._duration && currentTime >= VideoPlayer._duration) {
                    Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', VideoPlayer._duration);
                    setTimeout(() => {
                        Backend.sendEvent('VIDEOPLAYER', 'COMPLETED', VideoPlayer._url);
                    }, 0);
                    clearInterval(VideoPlayer._progressTimer);
                } else {
                    Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', currentTime);
                }
            }, 10);
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

    public static setAutomaticallyWaitsToMinimizeStalling(value: boolean) {
        return;
    }

    private static _url: string | undefined;
    private static _duration: number | undefined;
    private static _width: number | undefined;
    private static _height: number | undefined;

    private static _videoView: HTMLVideoElement;
    private static _progressTimer: any;

}
