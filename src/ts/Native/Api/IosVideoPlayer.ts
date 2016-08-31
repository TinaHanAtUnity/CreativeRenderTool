import { NativeBridge } from 'Native/NativeBridge';
import { Observable2 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';

enum IosVideoPlayerEvent {
    LIKELY_TO_KEEP_UP,
    BUFFER_EMPTY,
    BUFFER_FULL,
    GENERIC_ERROR,
}

export class IosVideoPlayerApi extends NativeApi {

    public onLikelyToKeepUp: Observable2<string, boolean> = new Observable2();
    public onBufferEmpty: Observable2<string, boolean> = new Observable2();
    public onBufferFull: Observable2<string, boolean> = new Observable2();
    public onError: Observable2<string, string> = new Observable2();


    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case IosVideoPlayerEvent[IosVideoPlayerEvent.LIKELY_TO_KEEP_UP]:
                this.onLikelyToKeepUp.trigger(parameters[0], parameters[1]);
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_EMPTY]:
                this.onBufferEmpty.trigger(parameters[0], parameters[1]);
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_FULL]:
                this.onBufferFull.trigger(parameters[0], parameters[1]);
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.GENERIC_ERROR]:
                this.onError.trigger('video_error', parameters[0]);
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

}
