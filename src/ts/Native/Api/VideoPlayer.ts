import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { IosVideoPlayerApi } from 'Native/Api/IosVideoPlayer';
import { AndroidVideoPlayerApi } from 'Native/Api/AndroidVideoPlayer';
import { NativeApiWithEventHandlers } from 'Native/NativeApiWithEventHandlers';

enum VideoPlayerEvent {
    PROGRESS,
    COMPLETED,
    PREPARED,
    PREPARE_TIMEOUT,
    PLAY,
    PAUSE,
    SEEKTO,
    STOP,
}

export interface IVideoEventHandler {
    onProgress(progress: number): void;
    onCompleted(url: string): void;
    onPrepared(url: string, duration: number, width: number, height: number): void;
    onPrepareTimeout(url: string): void;
    onPlay(url: string): void;
    onPause(url: string): void;
    onSeek(url: string): void;
    onStop(url: string): void;
}

export class VideoPlayerApi extends NativeApiWithEventHandlers<IVideoEventHandler> {

    public Ios: IosVideoPlayerApi;
    public Android: AndroidVideoPlayerApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer');
        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosVideoPlayerApi(nativeBridge);
        } else if(nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidVideoPlayerApi(nativeBridge);
        }
    }

    public setProgressEventInterval(milliseconds: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setProgressEventInterval', [milliseconds]);
    }

    public getProgressEventInterval(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getProgressEventInterval');
    }

    public prepare(url: string, initialVolume: Double, timeout: number): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'prepare', [url, initialVolume, timeout]);
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

    public setAutomaticallyWaitsToMinimizeStalling(value: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setAutomaticallyWaitsToMinimizeStalling', [value]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case VideoPlayerEvent[VideoPlayerEvent.PROGRESS]:
                this._handlers.forEach(handler => handler.onProgress(parameters[0]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.COMPLETED]:
                this._handlers.forEach(handler => handler.onCompleted(parameters[0]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PREPARED]:
                this._handlers.forEach(handler => handler.onPrepared(parameters[0], parameters[1], parameters[2], parameters[3]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PREPARE_TIMEOUT]:
                this._handlers.forEach(handler => handler.onPrepareTimeout(parameters[0]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PLAY]:
                this._handlers.forEach(handler => handler.onPlay(parameters[0]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.PAUSE]:
                this._handlers.forEach(handler => handler.onPause(parameters[0]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.SEEKTO]:
                this._handlers.forEach(handler => handler.onSeek(parameters[0]));
                break;

            case VideoPlayerEvent[VideoPlayerEvent.STOP]:
                this._handlers.forEach(handler => handler.onStop(parameters[0]));
                break;

            default:
                if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    this.Ios.handleEvent(event, parameters);
                } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this.Android.handleEvent(event, parameters);
                }
        }
    }
}
