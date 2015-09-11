import NativeBridge from 'NativeBridge';

import VideoPlayer from 'Video/VideoPlayer';

export default class NativeVideoPlayer extends VideoPlayer {

    private _nativeBridge: NativeBridge;

    private _duration: number;

    private _eventBindings: Object = {
        'PREPARED': this.onPrepared,
        'PROGRESS': this.onProgress,
        'COMPLETED': this.onComplete
    };

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe('VIDEOPLAYER', this.onVideoEvent.bind(this));
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

    public seekTo(time: number, callback: Function): void {
        this._nativeBridge.invoke('VideoPlayer', 'seekTo', [time], callback);
    }

    private onPrepared(duration: number, width: number, height: number): void {
        this._duration = duration;
        console.log('Duration: ' + duration);
        console.log('Width: ' + width);
        console.log('Height: ' + height);
        this.trigger('videoplayer', 'prepared', duration, width, height);
        this.play();
    }

    private onProgress(progress: number): void {
        this.trigger('videoplayer', 'progress', progress);
        console.log('Progress: ' + Math.round((progress / this._duration) * 100) + '%');
    }

    private onComplete(url: string): void {
        this.trigger('videoplayer', 'completed', url);
        console.log('Completed');
    }

    private onVideoEvent(id: string, ...parameters: any[]): void {
        let eventHandler: Function = this._eventBindings[id];
        if(eventHandler) {
            eventHandler.apply(this, parameters);
        }
    }

}
