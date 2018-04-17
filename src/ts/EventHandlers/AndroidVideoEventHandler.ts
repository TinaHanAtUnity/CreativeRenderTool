import { IAndroidVideoEventHandler } from 'Native/Api/AndroidVideoPlayer';
import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';

export class AndroidVideoEventHandler extends BaseVideoEventHandler implements IAndroidVideoEventHandler {

    constructor(params: IVideoEventHandlerParams) {
        super(params);
    }

    public onInfo(url: string, what: number, extra: number): void {
        // EMPTY
    }

    public onGenericError(url: string, what: number, extra: number): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onAndroidGenericVideoError', what: what, extra: extra});
        this._nativeBridge.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);

        this.handleVideoError('video_player_generic_error', {
            'url': url,
            'position': this._video.getPosition(),
            'what': what,
            'extra': extra
        });
    }

    public onPrepareError(url: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onPrepareError'});
        this._nativeBridge.Sdk.logError('Unity Ads video player prepare error '  + url);

        this.handleVideoError('video_player_prepare_error', {
            'url': url,
            'position': this._video.getPosition()
        });
    }

    public onSeekToError(url: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onSeekToError'});
        this._nativeBridge.Sdk.logError('Unity Ads video player seek to error '  + url);

        this.handleVideoError('video_player_seek_to_error', {
            'url': url,
            'position': this._video.getPosition()
        });
    }

    public onPauseError(url: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onPauseError'});
        this._nativeBridge.Sdk.logError('Unity Ads video player pause error '  + url);

        this.handleVideoError('video_player_pause_error', {
            'url': url,
            'position': this._video.getPosition()
        });
    }

    public onIllegalStateError(url: string, isPlaying: boolean): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onIllegalStateError'});
        this._nativeBridge.Sdk.logError('Unity Ads video player illegal state error');

        this.handleVideoError('video_player_illegal_state_error', {
            'position': this._video.getPosition()
        });
    }
}
