import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

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

export class IosVideoPlayerApi extends NativeApi {

    protected _handlers: IIosVideoEventHandler[] = [];

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case IosVideoPlayerEvent[IosVideoPlayerEvent.LIKELY_TO_KEEP_UP]:
                this._handlers.forEach(handler => handler.onLikelyToKeepUp(parameters[0], parameters[1]));
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_EMPTY]:
                this._handlers.forEach(handler => handler.onBufferEmpty(parameters[0], parameters[1]));
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_FULL]:
                this._handlers.forEach(handler => handler.onBufferFull(parameters[0], parameters[1]));
                break;

            case IosVideoPlayerEvent[IosVideoPlayerEvent.GENERIC_ERROR]:
                this._handlers.forEach(handler => handler.onGenericError(parameters[0], parameters[1]));
                break;

            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

    public addEventHandler(handler: IIosVideoEventHandler): IIosVideoEventHandler {
        this._handlers.push(handler);
        return handler;
    }

    public removeEventHandler(handler: IIosVideoEventHandler): void {
        if(this._handlers.length) {
            if(typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            } else {
                this._handlers = [];
            }
        }
    }
}
