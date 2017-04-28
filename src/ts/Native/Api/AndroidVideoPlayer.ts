import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable0, Observable1, Observable3 } from 'Utilities/Observable';

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

export class AndroidVideoPlayerApi extends NativeApi {

    public readonly onInfo = new Observable3<string, number, number>();
    public readonly onGenericError = new Observable3<string, number, number>();
    public readonly onPrepareError = new Observable1<string>();
    public readonly onSeekToError = new Observable1<string>();
    public readonly onPauseError = new Observable1<string>();
    public readonly onIllegalStateError = new Observable0();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer');
    }

    public setInfoListenerEnabled(enabled: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setInfoListenerEnabled', [enabled]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case AndroidVideoPlayerEvent[AndroidVideoPlayerEvent.INFO]:
                this.onInfo.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.GENERIC_ERROR]:
                this.onGenericError.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.PAUSE_ERROR]:
                this.onPauseError.trigger(parameters[0]);
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.PREPARE_ERROR]:
                this.onPrepareError.trigger(parameters[0]);
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.SEEKTO_ERROR]:
                this.onSeekToError.trigger(parameters[0]);
                break;

            case AndroidVideoPlayerError[AndroidVideoPlayerError.ILLEGAL_STATE]:
                this.onIllegalStateError.trigger();
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

}
