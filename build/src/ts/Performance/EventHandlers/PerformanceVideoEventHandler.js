import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
export class PerformanceVideoEventHandler extends VideoEventHandler {
    constructor(parameters) {
        super(parameters);
        this._performanceAdUnit = parameters.adUnit;
        this._campaign = parameters.campaign;
    }
    onCompleted(url) {
        super.onCompleted(url);
        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }
    onPrepared(url, duration, width, height) {
        super.onPrepared(url, duration, width, height);
        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.setCallButtonVisible(true);
            if (TestEnvironment.get('debugOverlayEnabled')) {
                overlay.setDebugMessage('Performance Ad');
            }
        }
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.LOADED);
    }
    getVideoOrientation() {
        return this._performanceAdUnit.getVideoOrientation();
    }
    handleStartEvent(progress) {
        super.handleStartEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.START);
    }
    handleFirstQuartileEvent(progress) {
        super.handleFirstQuartileEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.FIRST_QUARTILE);
    }
    handleMidPointEvent(progress) {
        super.handleMidPointEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.MIDPOINT);
    }
    handleThirdQuartileEvent(progress) {
        super.handleThirdQuartileEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
    }
    handleCompleteEvent(url) {
        super.handleCompleteEvent(url);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.COMPLETE);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VWaWRlb0V2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9QZXJmb3JtYW5jZS9FdmVudEhhbmRsZXJzL1BlcmZvcm1hbmNlVmlkZW9FdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUVwRSxNQUFNLE9BQU8sNEJBQTZCLFNBQVEsaUJBQWlCO0lBSS9ELFlBQVksVUFBdUQ7UUFDL0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztJQUN6QyxDQUFDO0lBRU0sV0FBVyxDQUFDLEdBQVc7UUFDMUIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFekQsSUFBSSxTQUFTLEVBQUU7WUFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBRU0sVUFBVSxDQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQzFFLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQU8sRUFBRTtZQUNULE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDNUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQzdDO1NBQ0o7UUFDRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFUyxtQkFBbUI7UUFDekIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsUUFBZ0I7UUFDdkMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVTLHdCQUF3QixDQUFDLFFBQWdCO1FBQy9DLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFUyxtQkFBbUIsQ0FBQyxRQUFnQjtRQUMxQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRVMsd0JBQXdCLENBQUMsUUFBZ0I7UUFDL0MsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVTLG1CQUFtQixDQUFDLEdBQVc7UUFDckMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEUsQ0FBQztDQUNKIn0=