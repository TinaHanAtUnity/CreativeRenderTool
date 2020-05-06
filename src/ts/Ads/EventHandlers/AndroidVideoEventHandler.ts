import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IAndroidVideoEventHandler } from 'Ads/Native/Android/VideoPlayer';
import { VideoMetric } from 'Ads/Utilities/SDKMetrics';

export class AndroidVideoEventHandler extends BaseVideoEventHandler implements IAndroidVideoEventHandler {

    constructor(params: IVideoEventHandlerParams) {
        super(params);
    }

    public onInfo(url: string, what: number, extra: number): void {
        // EMPTY
    }

    public onGenericError(url: string, what: number, extra: number): void {
        this._core.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);
        this.handleVideoError(VideoMetric.GenericError);
    }

    public onPrepareError(url: string): void {
        this._core.Sdk.logError('Unity Ads video player prepare error ' + url);
        this.handleVideoError(VideoMetric.PrepareError);
    }

    public onSeekToError(url: string): void {
        this._core.Sdk.logError('Unity Ads video player seek to error ' + url);
        this.handleVideoError(VideoMetric.SeekToError);
    }

    public onPauseError(url: string): void {
        this._core.Sdk.logError('Unity Ads video player pause error ' + url);
        this.handleVideoError(VideoMetric.PauseError);
    }

    public onIllegalStateError(url: string, isPlaying: boolean): void {
        this._core.Sdk.logError('Unity Ads video player illegal state error');
        this.handleVideoError(VideoMetric.IllegalStateError);
    }
}
