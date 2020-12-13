import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { BaseVideoEventHandler } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoMetric } from 'Ads/Utilities/SDKMetrics';
export class IosVideoEventHandler extends BaseVideoEventHandler {
    constructor(params) {
        super(params);
    }
    onLikelyToKeepUp(url, likelyToKeepUp) {
        const container = this._adUnit.getContainer();
        if (!container.isPaused() && this._adUnit.canPlayVideo() && likelyToKeepUp) {
            this._adUnit.setVideoState(VideoState.PLAYING);
            this._ads.VideoPlayer.play();
        }
    }
    onBufferEmpty(url, bufferIsEmpty) {
        // EMPTY
    }
    onBufferFull(url, bufferIsFull) {
        // EMPTY
    }
    onGenericError(url, description) {
        this._core.Sdk.logError('Unity Ads video player generic error ' + url + ' ' + description);
        this.handleVideoError(VideoMetric.GenericError);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zVmlkZW9FdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0V2ZW50SGFuZGxlcnMvSW9zVmlkZW9FdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxxQkFBcUIsRUFBNEIsTUFBTSx5Q0FBeUMsQ0FBQztBQUUxRyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFdkQsTUFBTSxPQUFPLG9CQUFxQixTQUFRLHFCQUFxQjtJQUUzRCxZQUFZLE1BQWdDO1FBQ3hDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU0sZ0JBQWdCLENBQUMsR0FBVyxFQUFFLGNBQXVCO1FBQ3hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLGNBQWMsRUFBRTtZQUN4RSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRU0sYUFBYSxDQUFDLEdBQVcsRUFBRSxhQUFzQjtRQUNwRCxRQUFRO0lBQ1osQ0FBQztJQUVNLFlBQVksQ0FBQyxHQUFXLEVBQUUsWUFBcUI7UUFDbEQsUUFBUTtJQUNaLENBQUM7SUFFTSxjQUFjLENBQUMsR0FBVyxFQUFFLFdBQW1CO1FBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEQsQ0FBQztDQUNKIn0=