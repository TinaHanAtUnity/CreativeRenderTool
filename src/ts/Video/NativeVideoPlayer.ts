import NativeBridge = require('NativeBridge');

import VideoPlayer = require('VideoPlayer');
import Observer = require('Utilities/Observer');

class NativeVideoPlayer implements VideoPlayer, Observer {

    private _nativeBridge: NativeBridge;

    private _duration: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe("VIDEOPLAYER", this);
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

    private onPrepared(duration: number, width: number, height: number) {
        this._duration = duration;
        console.log("Width: " + width);
        console.log("Height: " + height);
        this.play();
    }

    private onProgress(progress: number) {
        console.log("Progress: " + Math.round((progress / this._duration) * 100) + "%");
    }

    private onComplete(url: string) {
        console.log("Completed");
    }

    private _eventBinding = {
        'PREPARED': this.onPrepared,
        'PROGRESS': this.onProgress,
        'COMPLETED': this.onComplete
    };

    trigger(id: string, ...parameters) {
        let eventHandler = this._eventBinding[id];
        if(eventHandler) {
            eventHandler.apply(this, parameters);
        }
    }

}

export = NativeVideoPlayer;