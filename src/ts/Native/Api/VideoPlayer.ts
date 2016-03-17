import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable3, Observable1, Observable4 } from 'Utilities/Observable';

enum VideoPlayerEvent {
    ON_ERROR,
    ON_PROGRESS,
    ON_INFO,
    ON_COMPLETED,
    ON_PREPARED,
    ON_PLAY,
    ON_PAUSE,
    ON_SEEK,
    ON_STOP
}

export class VideoPlayer {

    public static onError: Observable3<number, number, string>;
    public static onProgress: Observable1<number>;
    public static onInfo: Observable3<number, number, string>;
    public static onCompleted: Observable1<string>;
    public static onPrepared: Observable4<number, number, number, string>;
    public static onPlay: Observable1<string>;
    public static onPause: Observable1<string>;
    public static onSeek: Observable1<string>;
    public static onStop: Observable1<string>;

    private static ApiClass = 'VideoPlayer';

    public static setProgressEventInterval(milliseconds: number): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayer.ApiClass, 'setProgressEventInterval', [milliseconds]);
    }

    public static getProgressEventInterval(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(VideoPlayer.ApiClass, 'getProgressEventInterval');
    }

    public static prepare(url: string, initialVolume: Double): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(VideoPlayer.ApiClass, 'prepare', [url, initialVolume]);
    }

    public static play(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayer.ApiClass, 'play');
    }

    public static pause(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayer.ApiClass, 'pause');
    }

    public static stop(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayer.ApiClass, 'stop');
    }

    public static seekTo(time: number): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayer.ApiClass, 'seekTo', [time]);
    }

    public static getCurrentPosition(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(VideoPlayer.ApiClass, 'getCurrentPosition');
    }

    public static getVolume(): Promise<Double> {
        return NativeBridge.getInstance().invoke<Double>(VideoPlayer.ApiClass, 'getVolume');
    }

    public static setVolume(volume: Double): Promise<Double> {
        return NativeBridge.getInstance().invoke<Double>(VideoPlayer.ApiClass, 'setVolume', [volume]);
    }

    public static setInfoListenerEnabled(enabled: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayer.ApiClass, 'setInfoListenerEnabled', [enabled]);
    }

    public static handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case VideoPlayerEvent[VideoPlayerEvent.ON_ERROR]:
                VideoPlayer.onError.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PROGRESS]:
                VideoPlayer.onProgress.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_INFO]:
                VideoPlayer.onInfo.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_COMPLETED]:
                VideoPlayer.onCompleted.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PREPARED]:
                VideoPlayer.onPrepared.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PLAY]:
                VideoPlayer.onPlay.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PAUSE]:
                VideoPlayer.onPause.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_SEEK]:
                VideoPlayer.onSeek.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_STOP]:
                VideoPlayer.onStop.trigger(parameters[0]);
                break;

            default:
                throw new Error('AdUnit event ' + event + ' does not have an observable');
        }
    }

}
