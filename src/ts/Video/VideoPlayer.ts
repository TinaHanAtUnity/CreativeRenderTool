import Observable = require('Utilities/Observable');

class VideoPlayer extends Observable {
    prepare(url: string) {}
    play() {}
    pause() {}
    seekTo(time: number, callback: Function) {}
}

export = VideoPlayer;