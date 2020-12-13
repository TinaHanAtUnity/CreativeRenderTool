import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
export class XPromoVideoEventHandler extends VideoEventHandler {
    constructor(params) {
        super(params);
        this._xpromoAdUnit = params.adUnit;
        this._xpromoOperativeEventManager = params.operativeEventManager;
        this._xpromoCampaign = params.campaign;
    }
    onCompleted(url) {
        super.onCompleted(url);
        const endScreen = this._xpromoAdUnit.getEndScreen();
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
                overlay.setDebugMessage('XPromo');
            }
        }
    }
    handleStartEvent(progress) {
        this._xpromoOperativeEventManager.sendStart(this.getXPromoOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });
        this.sendTrackingEvent(TrackingEvent.START);
        this._ads.Listener.sendStartEvent(this._placement.getId());
    }
    handleFirstQuartileEvent(progress) {
        // Not sent for Xpromos
    }
    handleMidPointEvent(progress) {
        // Not sent for Xpromos
    }
    handleThirdQuartileEvent(progress) {
        this.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
    }
    handleCompleteEvent() {
        this._xpromoOperativeEventManager.sendView(this.getXPromoOperativeEventParams());
        this.sendTrackingEvent(TrackingEvent.COMPLETE);
    }
    getVideoOrientation() {
        return this._xpromoAdUnit.getVideoOrientation();
    }
    getXPromoOperativeEventParams() {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation()
        };
    }
    sendTrackingEvent(event) {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'xpromo');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vVmlkZW9FdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvWFByb21vL0V2ZW50SGFuZGxlcnMvWFByb21vVmlkZW9FdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFeEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBSWpFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUVwRSxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsaUJBQWlCO0lBTTFELFlBQVksTUFBMkY7UUFDbkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ25DLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7UUFDakUsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQzNDLENBQUM7SUFFTSxXQUFXLENBQUMsR0FBVztRQUMxQixLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEQsSUFBSSxTQUFTLEVBQUU7WUFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBRU0sVUFBVSxDQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQzFFLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQU8sRUFBRTtZQUNULE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDNUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyQztTQUNKO0lBQ0wsQ0FBQztJQUVTLGdCQUFnQixDQUFDLFFBQWdCO1FBQ3ZDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3hGLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVTLHdCQUF3QixDQUFDLFFBQWdCO1FBQy9DLHVCQUF1QjtJQUMzQixDQUFDO0lBRVMsbUJBQW1CLENBQUMsUUFBZ0I7UUFDMUMsdUJBQXVCO0lBQzNCLENBQUM7SUFFUyx3QkFBd0IsQ0FBQyxRQUFnQjtRQUMvQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFUyxtQkFBbUI7UUFDekIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVTLG1CQUFtQjtRQUN6QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUNwRCxDQUFDO0lBRU8sNkJBQTZCO1FBQ2pDLE9BQU87WUFDSCxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDMUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1NBQy9DLENBQUM7SUFDTixDQUFDO0lBRU8saUJBQWlCLENBQUMsS0FBb0I7UUFDMUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7Q0FDSiJ9