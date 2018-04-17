import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { IIosVideoEventHandler } from 'Native/Api/IosVideoPlayer';

export class IosVideoEventHandler extends BaseVideoEventHandler implements IIosVideoEventHandler {

    constructor(params: IVideoEventHandlerParams) {
        super(params);
    }

    public onLikelyToKeepUp(url: string, likelyToKeepUp: boolean): void {
        const container = this._adUnit.getContainer();
        container.addDiagnosticsEvent({type: 'onIosVideoLikelyToKeepUp', likelyToKeepUp: likelyToKeepUp, hasStarted: this._video.hasStarted()});
        if(!container.isPaused() && this._video.hasStarted() && likelyToKeepUp) {
            this._nativeBridge.VideoPlayer.play();
        }
    }

    public onBufferEmpty(url: string, bufferIsEmpty: boolean): void {
        // EMPTY
    }

    public onBufferFull(url: string, bufferIsFull: boolean): void {
        // EMPTY
    }

    public onGenericError(url: string, description: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onIosGenericVideoError', description: description});
        this._nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError('video_player_generic_error', {
            'url': url,
            'position': this._video.getPosition(),
            'description': description
        });
    }
}
