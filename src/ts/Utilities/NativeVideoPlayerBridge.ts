import { NativeBridge } from 'Native/NativeBridge';
import { IObserver4, IObserver1, IObserver0 } from 'Utilities/IObserver';
import { Double } from 'Utilities/Double';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Platform } from 'Constants/Platform';

enum PlayerState {
    NONE,
    PLAYING,
    PAUSED,
    ENDED
}

export class NativeVideoPlayerBridge {

    public readonly onPlay = new Observable0();
    public readonly onPause = new Observable0();
    public readonly onComplete = new Observable0();
    public readonly onPrepare = new Observable1<number>();
    public readonly onProgress = new Observable1<number>();

    private _nativeBridge: NativeBridge;
    private _iframe: HTMLIFrameElement;
    private _messageListener: any;
    private _playerState: PlayerState = PlayerState.NONE;
    private _container: AdUnitContainer;
    private _videoUrl: string;
    private _progress: number = 0;

    private _videoPreparedHandler: IObserver4<string, number, number, number>;
    private _videoProgressHandler: IObserver1<number>;
    private _videoPlayHandler: IObserver0;
    private _videoPauseHandler: IObserver0;
    private _videoCompleteHandler: IObserver0;
    private _videoGenericErrorHandler: IObserver0;
    private _containerShowHandler: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer) {
        this._nativeBridge = nativeBridge;
        this._container = container;

        this._videoPreparedHandler = (url, duration, width, height) => this.onVideoPrepared(url, duration, width, height);
        this._videoProgressHandler = (progress) => this.onVideoProgress(progress);
        this._videoPlayHandler = () => this.onVideoPlay();
        this._videoPauseHandler = () => this.onVideoPause();
        this._videoCompleteHandler = () => this.onVideoComplete();
        this._videoGenericErrorHandler = () => this.onVideoError();
        this._containerShowHandler = () => this.onShow();

        this._messageListener = (e: MessageEvent) => this.onMessage(e);
    }

    public connect(iframe: HTMLIFrameElement) {
        this._iframe = iframe;
        window.addEventListener('message', this._messageListener);

        this._container.onShow.subscribe(this._containerShowHandler);
        this._nativeBridge.VideoPlayer.onPrepared.subscribe(this._videoPreparedHandler);
        this._nativeBridge.VideoPlayer.onProgress.subscribe(this._videoProgressHandler);
        this._nativeBridge.VideoPlayer.onPlay.subscribe(this._videoPlayHandler);
        this._nativeBridge.VideoPlayer.onPause.subscribe(this._videoPauseHandler);
        this._nativeBridge.VideoPlayer.onCompleted.subscribe(this._videoCompleteHandler);
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.VideoPlayer.Android.onGenericError.subscribe(this._videoGenericErrorHandler);
        } else {
            this._nativeBridge.VideoPlayer.Ios.onGenericError.subscribe(this._videoGenericErrorHandler);
        }
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);

        this._container.onShow.unsubscribe(this._containerShowHandler);
        this._nativeBridge.VideoPlayer.onPrepared.unsubscribe(this._videoPreparedHandler);
        this._nativeBridge.VideoPlayer.onProgress.unsubscribe(this._videoProgressHandler);
        this._nativeBridge.VideoPlayer.onPlay.unsubscribe(this._videoPlayHandler);
        this._nativeBridge.VideoPlayer.onPause.unsubscribe(this._videoPauseHandler);
        this._nativeBridge.VideoPlayer.onCompleted.unsubscribe(this._videoCompleteHandler);
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.VideoPlayer.Android.onGenericError.unsubscribe(this._videoGenericErrorHandler);
        } else {
            this._nativeBridge.VideoPlayer.Ios.onGenericError.unsubscribe(this._videoGenericErrorHandler);
        }
    }

    public pauseVideo() {
        this._nativeBridge.VideoPlayer.pause();
    }

    public stopVideo() {
        this._nativeBridge.VideoPlayer.stop();
    }

    public muteVideo() {
        this.setVolume(0.0);
    }

    public unmuteVideo() {
        this.setVolume(1.0);
    }

    public seek(time: number) {
        this._nativeBridge.VideoPlayer.seekTo(time);
        this._progress = time;
    }

    private onShow() {
        if (this._playerState === PlayerState.PLAYING) {
            // must prepare and show
            this._nativeBridge.VideoPlayer.prepare(this._videoUrl, new Double(1.0), 10000);
        }
    }

    private setVolume(volume: number) {
        this._nativeBridge.VideoPlayer.setVolume(new Double(volume));
        this.sendMessage('volumechange', {
            volume: volume
        });
    }

    private sendMessage(event: string, data?: any) {
        const eventData = <IPlayerEventData>{
            type: 'player',
            event: event
        };
        if (data) {
            eventData.data = data;
        }
        this._iframe.contentWindow.postMessage(eventData, '*');
    }

    private onMessage(e: MessageEvent) {
        const data = <IPlayerEventData>e.data;
        if (data.type && data.type === 'player') {
            this.handleEvent(data.event, data.data);
        }
    }

    private handleEvent(event: string, data: any) {
        switch (event) {
            case 'prepare':
                this.onPrepareVideo((<IPrepareEventData>data).url);
                break;
            case 'play':
                this.onPlayVideo();
                break;
            case 'pause':
                this.onPauseVideo();
                break;
            case 'resize':
                this.onResize((<ClientRect>data));
                break;
        }
    }

    private onPrepareVideo(url: string) {
        this._videoUrl = url;
        this.sendMessage('loadstart');
        this._nativeBridge.VideoPlayer.prepare(url, new Double(1.0), 10000);
    }

    private onPlayVideo() {
        this._nativeBridge.VideoPlayer.play();
    }

    private onPauseVideo() {
        this._nativeBridge.VideoPlayer.pause();
    }

    private onResize(rect: ClientRect) {
        this._container.setViewFrame('videoplayer', rect.left, rect.top, rect.width, rect.height);
    }

    private onVideoPrepared(url: string, duration: number, width: number, height: number) {
        if (this._playerState === PlayerState.PLAYING) {
            this.resumeAfterPaused();
        } else {
            this._progress = 0;
            this.notifyPrepared(duration / 1000.0);
            this.notifyCanPlay();
            this.onPrepare.trigger(duration);
        }
    }

    private resumeAfterPaused() {
        this._nativeBridge.VideoPlayer.seekTo(this._progress).then(() => {
            this._nativeBridge.VideoPlayer.play();
        });
    }

    private notifyCanPlay() {
        this.sendMessage('canplay');
    }

    private notifyPrepared(duration: number) {
        this.sendMessage('prepared', {
            duration: duration
        });
    }

    private onVideoProgress(progress: number) {
        this._progress = progress;
        this.notifyProgress(progress / 1000.0);
        this.onProgress.trigger(progress);
    }

    private notifyProgress(progress: number) {
        this.sendMessage('progress', {
            progress: progress
        });
    }

    private onVideoPlay() {
        if (this._playerState === PlayerState.PAUSED) {
            this.notifyPlay();
        }
        this._playerState = PlayerState.PLAYING;
        this.notifyPlaying();
        this.onPlay.trigger();
    }

    private notifyPlay() {
        this.sendMessage('play');
    }

    private notifyPlaying() {
        this.sendMessage('playing');
    }

    private onVideoPause() {
        this._playerState = PlayerState.PAUSED;
        this.notifyPause();
        this.onPause.trigger();
    }

    private notifyPause() {
        this.sendMessage('pause');
    }

    private onVideoComplete() {
        this._playerState = PlayerState.ENDED;
        this.notifyEnd();
        this.onComplete.trigger();
    }

    private notifyEnd() {
        this.sendMessage('ended');
    }

    private onVideoError() {
        this.sendMessage('error', new Error('A video error occurred'));
    }
}

export interface IPlayerEventData {
    type?: string;
    event: string;
    data: any;
}

interface IPrepareEventData {
    url: string;
}
