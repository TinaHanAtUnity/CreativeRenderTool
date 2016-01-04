import { NativeBridge } from 'NativeBridge';

import { VideoPlayer } from 'Video/VideoPlayer';
import { Double } from 'Utilities/Double';
import { IObserver } from 'Utilities/IObserver';

export class NativeVideoPlayer extends VideoPlayer {

    private _nativeBridge: NativeBridge;

    private _events;
    private _preparedObserver: IObserver;
    private _progressObserver: IObserver;
    private _completedObserver: IObserver;

    private _duration: number;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
    }

    public prepare(url: string, volume: Double): Promise<any[]> {
        this.reset();
        return this._nativeBridge.invoke('VideoPlayer', 'prepare', [url, volume]);
    }

    public play(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'play');
    }

    public pause(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'pause');
    }

    public seekTo(time: number): Promise<any[]> {
        this.reset();
        return this._nativeBridge.invoke('VideoPlayer', 'seekTo', [time]);
    }

    public stop(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'stop');
    }

    public getVolume(): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'getVolume');
    }

    public setVolume(volume: Double): Promise<any[]> {
        return this._nativeBridge.invoke('VideoPlayer', 'setVolume', [volume]);
    }

    public reset(): Promise<any[]> {
        this._events = [
            {type: 'start', time: 0},
            {type: 'first_quartile', time: 0.25},
            {type: 'mid_point', time: 0.5},
            {type: 'third_quartile', time: 0.75},
            {type: 'complete', time: 1}
        ];
        this._nativeBridge.unsubscribe('VIDEOPLAYER_PREPARED', this._preparedObserver);
        this._nativeBridge.unsubscribe('VIDEOPLAYER_PROGRESS', this._progressObserver);
        this._nativeBridge.unsubscribe('VIDEOPLAYER_COMPLETED', this._completedObserver);
        this._preparedObserver = this._nativeBridge.subscribe('VIDEOPLAYER_PREPARED', this.onPrepared.bind(this));
        this._progressObserver = this._nativeBridge.subscribe('VIDEOPLAYER_PROGRESS', this.onProgress.bind(this));
        this._completedObserver = this._nativeBridge.subscribe('VIDEOPLAYER_COMPLETED', this.onComplete.bind(this));
        return;
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

}
