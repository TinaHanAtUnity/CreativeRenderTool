interface VideoPlayer {
    prepare(url: string);
    play();
    pause();
}

export = VideoPlayer;