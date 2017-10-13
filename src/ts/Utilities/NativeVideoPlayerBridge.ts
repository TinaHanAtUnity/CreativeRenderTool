import { NativeBridge } from 'Native/NativeBridge';
import { IObserver4, IObserver1, IObserver0 } from 'Utilities/IObserver';
import { Double } from 'Utilities/Double';
import { Observable0, Observable1 } from 'Utilities/Observable';

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

    private _videoPreparedHandler: IObserver4<string, number, number, number>;
    private _videoProgressHandler: IObserver1<number>;
    private _videoPlayHandler: IObserver0;
    private _videoPauseHandler: IObserver0;
    private _videoCompleteHandler: IObserver0;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._videoPreparedHandler = (url, duration, width, height) => this.onVideoPrepared(url, duration, width, height);
        this._videoProgressHandler = (progress) => this.onVideoProgress(progress);
        this._videoPlayHandler = () => this.onVideoPlay();
        this._videoPauseHandler = () => this.onVideoPause();
        this._videoCompleteHandler = () => this.onVideoComplete();

        this._messageListener = (e: MessageEvent) => this.onMessage(e);
    }

    public connect(iframe: HTMLIFrameElement) {
        this._iframe = iframe;
        window.addEventListener('message', this._messageListener);

        this._nativeBridge.VideoPlayer.onPrepared.subscribe(this._videoPreparedHandler);
        this._nativeBridge.VideoPlayer.onProgress.subscribe(this._videoProgressHandler);
        this._nativeBridge.VideoPlayer.onPlay.subscribe(this._videoPlayHandler);
        this._nativeBridge.VideoPlayer.onPause.subscribe(this._videoPauseHandler);
        this._nativeBridge.VideoPlayer.onCompleted.subscribe(this._videoCompleteHandler);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);

        this._nativeBridge.VideoPlayer.onPrepared.unsubscribe(this._videoPreparedHandler);
        this._nativeBridge.VideoPlayer.onProgress.unsubscribe(this._videoProgressHandler);
        this._nativeBridge.VideoPlayer.onPlay.unsubscribe(this._videoPlayHandler);
        this._nativeBridge.VideoPlayer.onPause.unsubscribe(this._videoPauseHandler);
        this._nativeBridge.VideoPlayer.onCompleted.unsubscribe(this._videoCompleteHandler);
    }

    public notifyCanPlay() {
        this.sendMessage('canplay');
    }

    public notifyPrepared(duration: number) {
        this.sendMessage('prepared', {
            duration: duration
        });
    }

    public notifyProgress(progress: number) {
        this.sendMessage('progress', {
            progress: progress
        });
    }

    public notifyPlay() {
        this.sendMessage('play');
    }

    public notifyPlaying() {
        this.sendMessage('playing');
    }

    public notifyPause() {
        this.sendMessage('pause');
    }

    public notifyEnd() {
        this.sendMessage('ended');
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
        }
    }
    private onVideoPrepared(url: string, duration: number, width: number, height: number) {
        this.notifyPrepared(duration / 1000.0);
        this.notifyCanPlay();
        this.onPrepare.trigger(duration);
    }

    private onVideoProgress(progress: number) {
        this.notifyProgress(progress / 1000.0);
        this.onProgress.trigger(progress);
    }

    private onPrepareVideo(url: string) {
        this._nativeBridge.VideoPlayer.prepare(url, new Double(1.0), 10000);
    }

    private onPlayVideo() {
        this._nativeBridge.VideoPlayer.play();
    }

    private onVideoPlay() {
        if (this._playerState === PlayerState.PAUSED) {
            this.notifyPlay();
        }
        this._playerState = PlayerState.PLAYING;
        this.notifyPlaying();
        this.onPlay.trigger();
    }

    private onVideoPause() {
        this._playerState = PlayerState.PAUSED;
        this.notifyPause();
        this.onPause.trigger();
    }

    private onVideoComplete() {
        this._playerState = PlayerState.ENDED;
        this.notifyEnd();
        this.onComplete.trigger();
    }
}

interface IPlayerEventData {
    type?: string;
    event: string;
    data: any;
}

interface IPrepareEventData {
    url: string;
}
