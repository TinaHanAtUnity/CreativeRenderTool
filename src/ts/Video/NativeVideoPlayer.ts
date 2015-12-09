import { NativeBridge } from 'NativeBridge';

import { VideoPlayer } from 'Video/VideoPlayer';
import { Double } from 'Utilities/Double';

export class NativeVideoPlayer extends VideoPlayer {

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

    public prepare(url: string, volume: Double): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'prepare', [url, volume]);
    }

    public play(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'play', []);
    }

    public pause(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'pause', []);
    }

    public seekTo(time: number): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'seekTo', [time]);
    }

    public getVolume(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'getVolume', []);
    }

    public setVolume(volume: Double): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'setVolume', [volume]);
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
