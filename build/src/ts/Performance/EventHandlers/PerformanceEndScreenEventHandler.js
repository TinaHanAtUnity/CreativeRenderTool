import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
export class PerformanceEndScreenEventHandler extends EndScreenEventHandler {
    constructor(adUnit, parameters, storeHandler) {
        super(adUnit, parameters, storeHandler);
    }
    onKeyEvent(keyCode) {
        if (keyCode === 4 /* BACK */ && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }
    onEndScreenDownload(parameters) {
        super.onEndScreenDownload(parameters);
        this._adUnit.sendTrackingEvent(TrackingEvent.CLICK);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VFbmRTY3JlZW5FdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvUGVyZm9ybWFuY2UvRXZlbnRIYW5kbGVycy9QZXJmb3JtYW5jZUVuZFNjcmVlbkV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUtoRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFcEUsTUFBTSxPQUFPLGdDQUFpQyxTQUFRLHFCQUE2RDtJQUUvRyxZQUFZLE1BQXlCLEVBQUUsVUFBd0MsRUFBRSxZQUEyQjtRQUN4RyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sVUFBVSxDQUFDLE9BQWU7UUFDN0IsSUFBSSxPQUFPLGlCQUFpQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3RGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDdkI7SUFDTCxDQUFDO0lBRU0sbUJBQW1CLENBQUMsVUFBMkM7UUFDbEUsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDSiJ9