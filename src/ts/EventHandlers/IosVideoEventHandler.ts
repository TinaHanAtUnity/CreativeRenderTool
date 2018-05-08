import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { IIosVideoEventHandler } from 'Native/Api/IosVideoPlayer';
import { VideoState } from 'AdUnits/VideoAdUnit';

export class IosVideoEventHandler extends BaseVideoEventHandler implements IIosVideoEventHandler {

    constructor(params: IVideoEventHandlerParams) {
        super(params);
    }

    public onLikelyToKeepUp(url: string, likelyToKeepUp: boolean): void {
        const container = this._adUnit.getContainer();
        if(!container.isPaused() && (this._adUnit.getVideoState() === VideoState.PLAYING || this._adUnit.getVideoState() === VideoState.PAUSED) && likelyToKeepUp) {
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
        this._nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError('video_player_generic_error', {
            'url': url,
            'position': this._video.getPosition(),
            'description': description
        });
    }
}
