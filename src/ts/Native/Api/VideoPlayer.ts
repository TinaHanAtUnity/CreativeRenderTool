import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable3, Observable1, Observable4 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';

enum VideoPlayerEvent {
    GENERIC_ERROR,
    PROGRESS,
    INFO,
    COMPLETED,
    PREPARED,
    PREPARE_ERROR,
    PLAY,
    PAUSE_ERROR,
    PAUSE,
    SEEKTO_ERROR,
    SEEKTO,
    STOP,
    ILLEGAL_STATE
}

export class VideoPlayerApi extends NativeApi {

    public onError: Observable3<number, number, string> = new Observable3();
    public onProgress: Observable1<number> = new Observable1();
    public onInfo: Observable3<number, number, string> = new Observable3();
    public onCompleted: Observable1<string> = new Observable1();
    public onPrepared: Observable4<number, number, number, string> = new Observable4();
    public onPlay: Observable1<string> = new Observable1();
    public onPause: Observable1<string> = new Observable1();
    public onSeek: Observable1<string> = new Observable1();
    public onStop: Observable1<string> = new Observable1();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer');
    }

    public setProgressEventInterval(milliseconds: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setProgressEventInterval', [milliseconds]);
    }

    public getProgressEventInterval(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getProgressEventInterval');
    }

    public prepare(url: string, initialVolume: Double): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'prepare', [url, initialVolume]);
    }

    public play(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'play');
    }

    public pause(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'pause');
    }

    public stop(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'stop');
    }

    public seekTo(time: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'seekTo', [time]);
    }

    public getCurrentPosition(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getCurrentPosition');
    }

    public getVolume(): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this._apiClass, 'getVolume');
    }

    public setVolume(volume: Double): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this._apiClass, 'setVolume', [volume]);
    }

    public setInfoListenerEnabled(enabled: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setInfoListenerEnabled', [enabled]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case VideoPlayerEvent[VideoPlayerEvent.GENERIC_ERROR]:
                this.onError.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PROGRESS]:
                this.onProgress.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.INFO]:
                this.onInfo.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.COMPLETED]:
                this.onCompleted.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PREPARED]:
                this.onPrepared.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PLAY]:
                this.onPlay.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PAUSE]:
                this.onPause.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.SEEKTO]:
                this.onSeek.trigger(parameters[0]);
                break;

            case VideoPlayerEvent[VideoPlayerEvent.STOP]:
                this.onStop.trigger(parameters[0]);
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

}
