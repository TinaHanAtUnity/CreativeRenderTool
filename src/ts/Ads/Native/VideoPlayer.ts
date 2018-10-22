import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { Platform } from 'Core/Constants/Platform';
import { ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';
import { EventedNativeApi } from 'Core/Native/Bridge/EventedNativeApi';
import { EventCategory } from '../../Core/Constants/EventCategory';

enum VideoPlayerEvent {
    PROGRESS,
    COMPLETED,
    PREPARED,
    PREPARE_TIMEOUT,
    PLAY,
    PAUSE,
    SEEKTO,
    STOP
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

export class VideoPlayerApi extends EventedNativeApi<IVideoEventHandler> {

    public readonly iOS?: IosVideoPlayerApi;
    public readonly Android?: AndroidVideoPlayerApi;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer', ApiPackage.ADS, EventCategory.VIDEOPLAYER);
        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.iOS = new IosVideoPlayerApi(nativeBridge);
        } else if(nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidVideoPlayerApi(nativeBridge);
        }
    }

    public setProgressEventInterval(milliseconds: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setProgressEventInterval', [milliseconds]);
    }

    public getProgressEventInterval(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getProgressEventInterval');
    }

    public prepare(url: string, initialVolume: Double, timeout: number): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'prepare', [url, initialVolume, timeout]);
    }

    public play(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'play');
    }

    public pause(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'pause');
    }

    public stop(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'stop');
    }

    public seekTo(time: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'seekTo', [time]);
    }

    public getCurrentPosition(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getCurrentPosition');
    }

    public getVolume(): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this._fullApiClassName, 'getVolume');
    }

    public setVolume(volume: Double): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this._fullApiClassName, 'setVolume', [volume]);
    }

    public setAutomaticallyWaitsToMinimizeStalling(value: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setAutomaticallyWaitsToMinimizeStalling', [value]);
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
                    this.iOS!.handleEvent(event, parameters);
                } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this.Android!.handleEvent(event, parameters);
                }
        }
    }
}
