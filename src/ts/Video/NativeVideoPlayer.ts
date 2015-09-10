import NativeBridge = require('NativeBridge');

import VideoPlayer = require('Video/VideoPlayer');
import Observable = require('Utilities/Observable');

class NativeVideoPlayer extends VideoPlayer {

    private _nativeBridge: NativeBridge;

    private _duration: number;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe("VIDEOPLAYER", this.onVideoEvent.bind(this));
    }

    prepare(url: string) {
        this._nativeBridge.invoke("VideoPlayer", "prepare", [url], (status) => {});
    }

    play() {
        this._nativeBridge.invoke("VideoPlayer", "play", [], (status) => {});
    }

    pause() {
        this._nativeBridge.invoke("VideoPlayer", "pause", [], (status) => {});
    }

    seekTo(time: number, callback: Function) {
        this._nativeBridge.invoke("VideoPlayer", "seekTo", [time], callback);
    }

    private onPrepared(duration: number, width: number, height: number) {
        this._duration = duration;
        console.log("Duration: " + duration);
        console.log("Width: " + width);
        console.log("Height: " + height);
        this.trigger('videoplayer', 'prepared', duration, width, height);
        this.play();
    }

    private onProgress(progress: number) {
        this.trigger('videoplayer', 'progress', progress);
        console.log("Progress: " + Math.round((progress / this._duration) * 100) + "%");
    }

    private onComplete(url: string) {
        this.trigger('videoplayer', 'completed', url);
        console.log("Completed");
    }

    private _eventBindings = {
        'PREPARED': this.onPrepared,
        'PROGRESS': this.onProgress,
        'COMPLETED': this.onComplete
    };

    private onVideoEvent(id: string, ...parameters) {
        let eventHandler = this._eventBindings[id];
        if(eventHandler) {
            eventHandler.apply(this, parameters);
        }
    }

}

export = NativeVideoPlayer;