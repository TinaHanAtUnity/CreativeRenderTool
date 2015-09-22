import { Callback, NativeBridge } from 'NativeBridge';

import { VideoPlayer } from 'Video/VideoPlayer';

export default class NativeVideoPlayer extends VideoPlayer {

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe({
            'VIDEOPLAYER_PREPARED': this.onPrepared.bind(this),
            'VIDEOPLAYER_PROGRESS': this.onProgress.bind(this),
            'VIDEOPLAYER_COMPLETED': this.onComplete.bind(this)
        });
    }

    public prepare(url: string): void {
        this._nativeBridge.invoke('VideoPlayer', 'prepare', [url]);
    }

    public play(): void {
        this._nativeBridge.invoke('VideoPlayer', 'play', []);
    }

    public pause(): void {
        this._nativeBridge.invoke('VideoPlayer', 'pause', []);
    }

    public seekTo(time: number, callback: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'seekTo', [time], callback);
    }

    private onPrepared(duration: number, width: number, height: number): void {
        this.trigger('prepared', duration, width, height);
        this.play();
    }

    private onProgress(progress: number): void {
        this.trigger('progress', progress);
    }

    private onComplete(url: string): void {
        this.trigger('completed', url);
    }

}
