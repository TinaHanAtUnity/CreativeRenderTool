import { NativeBridge } from 'Native/NativeBridge';
import { Observable1, Observable2 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';

export enum IosVideoPlayerEvent {
    LIKELY_TO_KEEP_UP,
    BUFFER_EMPTY,
    BUFFER_FULL,
    GENERIC_ERROR,
    PREPARE_ERROR,
    VIDEOVIEW_NULL
}

export class IosVideoPlayerApi extends NativeApi {

    public onLikelyToKeepUp: Observable2<string, boolean> = new Observable2<string, boolean>();
    public onBufferEmpty: Observable2<string, boolean> = new Observable2<string, boolean>();
    public onBufferFull: Observable2<string, boolean> = new Observable2<string, boolean>();
    public onGenericError: Observable2<string, string> = new Observable2<string, string>();
    public onPrepareError: Observable1<string> = new Observable1<string>();

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
                this.onGenericError.trigger(parameters[0], parameters[1]);
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.PREPARE_ERROR]:
                this.onPrepareError.trigger(parameters[0]);
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

}
