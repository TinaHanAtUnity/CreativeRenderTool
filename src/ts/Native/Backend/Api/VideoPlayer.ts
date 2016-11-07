import { Backend } from 'Native/Backend/Backend';

export class VideoPlayer {

    public static prepare(url: string) {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(videoView) {
            videoView.addEventListener('canplay', () => {
                VideoPlayer._url = url;
                const duration = VideoPlayer._duration = Math.round(videoView.duration * 1000);
                const width = VideoPlayer._width = videoView.videoWidth;
                const height = VideoPlayer._height = videoView.videoHeight;
                Backend.sendEvent('VIDEOPLAYER', 'PREPARED', duration, width, height, url);
            }, false);
            videoView.src = url;
        } else {
            // tslint:disable:no-string-literal
            const exec = window['exec'];
            exec('ffprobe -v quiet -of json=compact=1 -show_streams "' + url + '"', (err: Error, stdout: string, stderr: string) => {
                const streams = JSON.parse(stdout).streams;
                streams.forEach((stream: any) => {
                    if(stream.codec_type === 'video') {
                        const duration = VideoPlayer._duration = Math.round(parseFloat(stream.duration) * 1000);
                        const width = VideoPlayer._width = stream.width;
                        const height = VideoPlayer._height = stream.height;
                        VideoPlayer._url = url;
                        Backend.sendEvent('VIDEOPLAYER', 'PREPARED', duration, width, height, url);
                    }
                });
            });
            // tslint:enable:no-string-literal
        }
    }

    public static setVolume(volume: number) {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(videoView) {
            videoView.volume = volume;
        }
    }

    public static play() {
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(videoView) {
            videoView.addEventListener('timeupdate', () => {
                Backend.sendEvent('VIDEOPLAYER', 'PROGRESS', Math.round(videoView.currentTime * 1000));
            }, false);
            videoView.addEventListener('ended', () => {
                Backend.sendEvent('VIDEOPLAYER', 'COMPLETED', VideoPlayer._url);
            }, false);
            videoView.play();
        } else {
            let currentTime = 0;
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
        const videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
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

    private static _progressTimer: any;

}
