import { BackendApi } from '../BackendApi';

export class VideoPlayer extends BackendApi {

    public setProgressEventInterval(milliseconds: number) {
        return;
    }

    public prepare(url: string) {
        if(url.indexOf('file://http') !== -1) {
            url = url.replace('file://', '');
        }

        if('exec' in window) {
            // tslint:disable:no-string-literal
            const exec = (<any>window)['exec'];
            exec('curl -s "' + url + '" | exiftool -j -').then((result: any) => {
                const stdout: string = result.stdout;
                const stream = JSON.parse(stdout)[0];
                const duration = this._duration = Math.round(parseFloat(stream.Duration) * 1000);
                const splitImageSize = stream.ImageSize.split('x');
                const width = this._width = splitImageSize[0];
                const height = this._height = splitImageSize[1];
                this._url = url;
                this._backend.sendEvent('VIDEOPLAYER', 'PREPARED', url, duration, width, height);
            });
            // tslint:enable:no-string-literal
        } else {
            let videoView = this._videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
            if(!videoView) {
                videoView = this._videoView = document.createElement('video');
            }
            videoView.addEventListener('canplay', () => {
                this._url = url;
                const duration = this._duration = Math.round(videoView.duration * 1000);
                const width = this._width = videoView.videoWidth;
                const height = this._height = videoView.videoHeight;
                this._backend.sendEvent('VIDEOPLAYER', 'PREPARED', url, duration, width, height);
            }, false);
            videoView.src = url;
        }
    }

    public setVolume(volume: number) {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(!videoView) {
            videoView = this._videoView;
        }
        if(videoView) {
            videoView.volume = volume;
        }
    }

    public play() {
        if(this._videoView) {
            const videoView = this._videoView;
            videoView.addEventListener('play', () => {
                this._backend.sendEvent('VIDEOPLAYER', 'PLAY', this._url);
            }, false);
            videoView.addEventListener('timeupdate', () => {
                this._backend.sendEvent('VIDEOPLAYER', 'PROGRESS', Math.round(videoView.currentTime * 1000));
            }, false);
            videoView.addEventListener('ended', () => {
                this._backend.sendEvent('VIDEOPLAYER', 'COMPLETED', this._url);
            }, false);
            videoView.play();
        } else {
            let currentTime = 0;
            this._backend.sendEvent('VIDEOPLAYER', 'PLAY');
            this._progressTimer = setInterval(() => {
                currentTime += 250;
                if(this._duration && currentTime >= this._duration) {
                    this._backend.sendEvent('VIDEOPLAYER', 'PROGRESS', this._duration);
                    setTimeout(() => {
                        this._backend.sendEvent('VIDEOPLAYER', 'COMPLETED', this._url);
                    }, 0);
                    clearInterval(this._progressTimer);
                } else {
                    this._backend.sendEvent('VIDEOPLAYER', 'PROGRESS', currentTime);
                }
            }, 10);
        }
    }

    public pause() {
        let videoView = <HTMLVideoElement>window.parent.document.getElementById('videoView');
        if(!videoView) {
            videoView = this._videoView;
        }
        if(videoView) {
            videoView.pause();
        }
        setTimeout(() => {
            this._backend.sendEvent('VIDEOPLAYER', 'PAUSE', this._url);
            this._backend.sendEvent('VIDEOPLAYER', 'STOP', this._url);
        }, 0);
    }

    public setAutomaticallyWaitsToMinimizeStalling(value: boolean) {
        return;
    }

    private _url: string | undefined;
    private _duration: number | undefined;
    private _width: number | undefined;
    private _height: number | undefined;

    private _videoView: HTMLVideoElement;
    private _progressTimer: any;

}
