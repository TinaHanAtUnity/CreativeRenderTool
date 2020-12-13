import { BaseVideoEventHandler } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoMetric } from 'Ads/Utilities/SDKMetrics';
export class AndroidVideoEventHandler extends BaseVideoEventHandler {
    constructor(params) {
        super(params);
    }
    onInfo(url, what, extra) {
        // EMPTY
    }
    onGenericError(url, what, extra) {
        this._core.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);
        this.handleVideoError(VideoMetric.GenericError);
    }
    onPrepareError(url) {
        this._core.Sdk.logError('Unity Ads video player prepare error ' + url);
        this.handleVideoError(VideoMetric.PrepareError);
    }
    onSeekToError(url) {
        this._core.Sdk.logError('Unity Ads video player seek to error ' + url);
        this.handleVideoError(VideoMetric.SeekToError);
    }
    onPauseError(url) {
        this._core.Sdk.logError('Unity Ads video player pause error ' + url);
        this.handleVideoError(VideoMetric.PauseError);
    }
    onIllegalStateError(url, isPlaying) {
        this._core.Sdk.logError('Unity Ads video player illegal state error');
        this.handleVideoError(VideoMetric.IllegalStateError);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZFZpZGVvRXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL0FuZHJvaWRWaWRlb0V2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUscUJBQXFCLEVBQTRCLE1BQU0seUNBQXlDLENBQUM7QUFFMUcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXZELE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxxQkFBcUI7SUFFL0QsWUFBWSxNQUFnQztRQUN4QyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWE7UUFDbEQsUUFBUTtJQUNaLENBQUM7SUFFTSxjQUFjLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxLQUFhO1FBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLGNBQWMsQ0FBQyxHQUFXO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSxhQUFhLENBQUMsR0FBVztRQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sWUFBWSxDQUFDLEdBQVc7UUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLG1CQUFtQixDQUFDLEdBQVcsRUFBRSxTQUFrQjtRQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDekQsQ0FBQztDQUNKIn0=