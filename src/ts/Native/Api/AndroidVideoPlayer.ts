import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable3, Observable4 } from 'Utilities/Observable';

enum AndroidVideoPlayerEvent {
    INFO
}

export enum AndroidVideoPlayerError {
    VIDEOVIEW_NULL,
    API_LEVEL_ERROR,
    GENERIC_ERROR
}

export class AndroidVideoPlayerApi extends NativeApi {

    public onInfo: Observable3<number, number, string> = new Observable3();
    public onError: Observable4<string, number, number, string> = new Observable4();

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
                this.onError.trigger('video_error', parameters[0], parameters[1], parameters[2]);
                break;
            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

}
