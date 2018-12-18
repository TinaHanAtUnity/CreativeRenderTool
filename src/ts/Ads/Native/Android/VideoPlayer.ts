import { EventedNativeApi } from 'Core/Native/Bridge/EventedNativeApi';
import { ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

enum AndroidVideoPlayerEvent {
    INFO
}

export enum AndroidVideoPlayerError {
    VIDEOVIEW_NULL,
    API_LEVEL_ERROR,
    GENERIC_ERROR,
    PAUSE_ERROR,
    PREPARE_ERROR,
    SEEKTO_ERROR,
    ILLEGAL_STATE
}

export interface IAndroidVideoEventHandler {
    onInfo(url: string, what: number, extra: number): void;
    onGenericError(url: string, what: number, extra: number): void;
    onPrepareError(url: string): void;
    onSeekToError(url: string): void;
    onPauseError(url: string): void;
    onIllegalStateError(url: string, isPlaying: boolean): void;
}

export class AndroidVideoPlayerApi extends EventedNativeApi<IAndroidVideoEventHandler> {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer', ApiPackage.ADS);
    }

    public setInfoListenerEnabled(enabled: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setInfoListenerEnabled', [enabled]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case AndroidVideoPlayerEvent[AndroidVideoPlayerEvent.INFO]:
                this._handlers.forEach(handler => handler.onInfo(<string>parameters[0], <number>parameters[1], <number>parameters[2]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.GENERIC_ERROR]:
                this._handlers.forEach(handler => handler.onGenericError(<string>parameters[0], <number>parameters[1], <number>parameters[2]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.PAUSE_ERROR]:
                this._handlers.forEach(handler => handler.onPauseError(<string>parameters[0]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.PREPARE_ERROR]:
                this._handlers.forEach(handler => handler.onPrepareError(<string>parameters[0]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.SEEKTO_ERROR]:
                this._handlers.forEach(handler => handler.onSeekToError(<string>parameters[0]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.ILLEGAL_STATE]:
                this._handlers.forEach(handler => handler.onIllegalStateError(<string>parameters[0], <boolean>parameters[1]));
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }
}
