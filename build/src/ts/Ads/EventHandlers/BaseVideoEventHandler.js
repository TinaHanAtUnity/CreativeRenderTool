import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { FinishState } from 'Core/Constants/FinishState';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
export class BaseVideoEventHandler {
    constructor(params) {
        this._platform = params.platform;
        this._core = params.core;
        this._ads = params.ads;
        this._adUnit = params.adUnit;
        this._campaign = params.campaign;
        this._video = params.video;
    }
    updateViewsOnVideoError() {
        this._adUnit.getContainer().reconfigure(0 /* ENDSCREEN */);
    }
    afterVideoCompleted() {
        this._adUnit.getContainer().reconfigure(0 /* ENDSCREEN */);
        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }
        this._adUnit.onFinish.trigger();
    }
    handleVideoError(metric) {
        if (this._adUnit.getVideoState() !== VideoState.ERRORED) {
            const previousState = this._adUnit.getVideoState();
            this._adUnit.setVideoState(VideoState.ERRORED);
            SDKMetrics.reportMetricEvent(metric);
            this._adUnit.setFinishState(FinishState.ERROR);
            this.updateViewsOnVideoError();
            const overlay = this._adUnit.getOverlay();
            if (overlay) {
                overlay.hide();
            }
            this._adUnit.onError.trigger();
            this._adUnit.onFinish.trigger();
            if (previousState === VideoState.NOT_READY || previousState === VideoState.PREPARING) {
                this._adUnit.hide();
                this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player prepare error');
            }
            else {
                this._adUnit.onVideoError();
                this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');
            }
        }
    }
    getVideoOrientation() {
        return undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVZpZGVvRXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL0Jhc2VWaWRlb0V2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFTbEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXpELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUk3RCxPQUFPLEVBQUUsVUFBVSxFQUFlLE1BQU0sMEJBQTBCLENBQUM7QUFrQm5FLE1BQU0sT0FBZ0IscUJBQXFCO0lBU3ZDLFlBQVksTUFBZ0M7UUFDeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQUVTLHVCQUF1QjtRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLFdBQVcsbUJBQTZCLENBQUM7SUFDekUsQ0FBQztJQUVTLG1CQUFtQjtRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLFdBQVcsbUJBQTZCLENBQUM7UUFFckUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQU8sRUFBRTtZQUNULE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNsQjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFUyxnQkFBZ0IsQ0FBQyxNQUFtQjtRQUMxQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEtBQUssVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUNyRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBRS9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2xCO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEMsSUFBSSxhQUFhLEtBQUssVUFBVSxDQUFDLFNBQVMsSUFBSSxhQUFhLEtBQUssVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO2FBQ3BIO2lCQUFNO2dCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzthQUM1RztTQUNKO0lBQ0wsQ0FBQztJQUVTLG1CQUFtQjtRQUN6QixPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0NBQ0oifQ==