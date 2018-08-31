import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IIosVideoEventHandler } from 'Common/Native/Api/iOS/IosVideoPlayer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';

export class IosVideoEventHandler extends BaseVideoEventHandler implements IIosVideoEventHandler {

    constructor(params: IVideoEventHandlerParams) {
        super(params);
    }

    public onLikelyToKeepUp(url: string, likelyToKeepUp: boolean): void {
        const container = this._adUnit.getContainer();
        if(!container.isPaused() && this._adUnit.canPlayVideo() && likelyToKeepUp) {
            this._adUnit.setVideoState(VideoState.PLAYING);
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
