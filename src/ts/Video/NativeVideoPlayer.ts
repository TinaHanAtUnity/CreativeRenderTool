import { Callback, NativeBridge } from 'NativeBridge';

import { VideoPlayer } from 'Video/VideoPlayer';
import Double from 'Utilities/Double';

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

    public prepare(url: string, volume: Double, callback?: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'prepare', [url, volume]);
    }

    public play(callback?: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'play', [], callback);
    }

    public pause(callback?: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'pause', []);
    }

    public seekTo(time: number, callback: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'seekTo', [time], callback);
    }

    public getVolume(callback: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'getVolume', [], callback);
    }

    public setVolume(volume: Double, callback: Callback): void {
        this._nativeBridge.invoke('VideoPlayer', 'setVolume', [volume], callback);
    }

    private onPrepared(duration: number, width: number, height: number): void {
        this.trigger('prepared', duration, width, height);
    }

    private onProgress(progress: number): void {
        this.trigger('progress', progress);
    }

    private onComplete(url: string): void {
        this.trigger('completed', url);
    }

}
