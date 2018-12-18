import { EventedNativeApi } from 'Core/Native/Bridge/EventedNativeApi';
import { ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export enum IosVideoPlayerEvent {
    LIKELY_TO_KEEP_UP,
    BUFFER_EMPTY,
    BUFFER_FULL,
    GENERIC_ERROR,
    VIDEOVIEW_NULL
}

export interface IIosVideoEventHandler {
    onLikelyToKeepUp(url: string, likelyToKeepUp: boolean): void;
    onBufferEmpty(url: string, bufferIsEmpty: boolean): void;
    onBufferFull(url: string, bufferIsFull: boolean): void;
    onGenericError(url: string, description: string): void;
}

export class IosVideoPlayerApi extends EventedNativeApi<IIosVideoEventHandler> {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer', ApiPackage.ADS);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case IosVideoPlayerEvent[IosVideoPlayerEvent.LIKELY_TO_KEEP_UP]:
                this._handlers.forEach(handler => handler.onLikelyToKeepUp(<string>parameters[0], <boolean>parameters[1]));
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_EMPTY]:
                this._handlers.forEach(handler => handler.onBufferEmpty(<string>parameters[0], <boolean>parameters[1]));
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_FULL]:
                this._handlers.forEach(handler => handler.onBufferFull(<string>parameters[0], <boolean>parameters[1]));
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.GENERIC_ERROR]:
                this._handlers.forEach(handler => handler.onGenericError(<string>parameters[0], <string>parameters[1]));
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }
}
