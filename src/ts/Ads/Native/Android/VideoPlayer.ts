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

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case AndroidVideoPlayerEvent[AndroidVideoPlayerEvent.INFO]:
                this._handlers.forEach(handler => handler.onInfo(parameters[0], parameters[1], parameters[2]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.GENERIC_ERROR]:
                this._handlers.forEach(handler => handler.onGenericError(parameters[0], parameters[1], parameters[2]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.PAUSE_ERROR]:
                this._handlers.forEach(handler => handler.onPauseError(parameters[0]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.PREPARE_ERROR]:
                this._handlers.forEach(handler => handler.onPrepareError(parameters[0]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.SEEKTO_ERROR]:
                this._handlers.forEach(handler => handler.onSeekToError(parameters[0]));
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.ILLEGAL_STATE]:
                this._handlers.forEach(handler => handler.onIllegalStateError(parameters[0], parameters[1]));
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }
}
