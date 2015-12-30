import { NativeBridge } from 'NativeBridge';

import { VideoPlayer } from 'Video/VideoPlayer';
import { Double } from 'Utilities/Double';

export class NativeVideoPlayer extends VideoPlayer {

    private _nativeBridge: NativeBridge;

    private _events;

    private _duration: number;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
    }

    public prepare(url: string, volume: Double): Promise<any[]> {
        this.resetEvents();
        this._nativeBridge.subscribe('VIDEOPLAYER_PREPARED', this.onPrepared.bind(this));
        this._nativeBridge.subscribe('VIDEOPLAYER_PROGRESS', this.onProgress.bind(this));
        this._nativeBridge.subscribe('VIDEOPLAYER_COMPLETED', this.onComplete.bind(this));
        return this._nativeBridge.invoke('VideoPlayer', 'prepare', [url, volume]);
    }

    public play(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'play', []);
    }

    public pause(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'pause', []);
    }

    public seekTo(time: number): Promise<any[]> {
        this.resetEvents();
        return this._nativeBridge.invoke('VideoPlayer', 'seekTo', [time]);
    }

    public getVolume(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'getVolume', []);
    }

    public setVolume(volume: Double): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'setVolume', [volume]);
    }

    private onPrepared(duration: number, width: number, height: number): void {
        this._duration = duration;
        this.trigger('prepared', duration, width, height);
    }

    private onProgress(progress: number): void {
        this.trigger('progress', progress);
        let percentage = progress / this._duration;
        let event = this._events.shift();
        if(percentage >= event.time) {
            console.log('videoEvent: ' + event.type);
            this.trigger(event.type);
        } else {
            this._events.unshift(event);
        }
    }

    private onComplete(url: string): void {
        this.trigger('completed', url);
    }

    private resetEvents() {
        this._events = [
            {type: 'start', time: 0},
            {type: 'first_quartile', time: 0.25},
            {type: 'mid_point', time: 0.5},
            {type: 'third_quartile', time: 0.75},
            {type: 'complete', time: 1}
        ];
    }

}
