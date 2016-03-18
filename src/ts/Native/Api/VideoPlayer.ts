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

export class VideoPlayerApi {

    public static onError: Observable3<number, number, string> = new Observable3();
    public static onProgress: Observable1<number> = new Observable1();
    public static onInfo: Observable3<number, number, string> = new Observable3();
    public static onCompleted: Observable1<string> = new Observable1();
    public static onPrepared: Observable4<number, number, number, string> = new Observable4();
    public static onPlay: Observable1<string> = new Observable1();
    public static onPause: Observable1<string> = new Observable1();
    public static onSeek: Observable1<string> = new Observable1();
    public static onStop: Observable1<string> = new Observable1();

    private static ApiClass = 'VideoPlayer';

    public static setProgressEventInterval(milliseconds: number): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayerApi.ApiClass, 'setProgressEventInterval', [milliseconds]);
    }

    public static getProgressEventInterval(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(VideoPlayerApi.ApiClass, 'getProgressEventInterval');
    }

    public static prepare(url: string, initialVolume: Double): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(VideoPlayerApi.ApiClass, 'prepare', [url, initialVolume]);
    }

    public static play(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayerApi.ApiClass, 'play');
    }

    public static pause(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayerApi.ApiClass, 'pause');
    }

    public static stop(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayerApi.ApiClass, 'stop');
    }

    public static seekTo(time: number): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayerApi.ApiClass, 'seekTo', [time]);
    }

    public static getCurrentPosition(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(VideoPlayerApi.ApiClass, 'getCurrentPosition');
    }

    public static getVolume(): Promise<Double> {
        return NativeBridge.getInstance().invoke<Double>(VideoPlayerApi.ApiClass, 'getVolume');
    }

    public static setVolume(volume: Double): Promise<Double> {
        return NativeBridge.getInstance().invoke<Double>(VideoPlayerApi.ApiClass, 'setVolume', [volume]);
    }

    public static setInfoListenerEnabled(enabled: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(VideoPlayerApi.ApiClass, 'setInfoListenerEnabled', [enabled]);
    }

    public static handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case VideoPlayerEvent[VideoPlayerEvent.ON_ERROR]:
                VideoPlayerApi.onError.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PROGRESS]:
                VideoPlayerApi.onProgress.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_INFO]:
                VideoPlayerApi.onInfo.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_COMPLETED]:
                VideoPlayerApi.onCompleted.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PREPARED]:
                VideoPlayerApi.onPrepared.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PLAY]:
                VideoPlayerApi.onPlay.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_PAUSE]:
                VideoPlayerApi.onPause.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_SEEK]:
                VideoPlayerApi.onSeek.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.ON_STOP]:
                VideoPlayerApi.onStop.trigger(parameters[0]);
                break;

            default:
                throw new Error('AdUnit event ' + event + ' does not have an observable');
        }
    }

}
