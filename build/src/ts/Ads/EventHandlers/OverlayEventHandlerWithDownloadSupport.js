import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
export class OverlayEventHandlerWithDownloadSupport extends OverlayEventHandler {
    constructor(adUnit, parameters, storeHandler, adUnitStyle) {
        super(adUnit, parameters, adUnitStyle);
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._overlay = this._adUnit.getOverlay();
        this._storeHandler = storeHandler;
    }
    onOverlayDownload(parameters) {
        this.setCallButtonEnabled(false);
        if (!parameters.skipEnabled) {
            // This is for the install now button test in rewarded ad video overlay.
            const operativeEventParams = this.getOperativeEventParams(parameters);
            this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            this._operativeEventManager.sendView(operativeEventParams);
        }
        this._storeHandler.onDownload(parameters);
        if (parameters.skipEnabled) {
            this.onOverlaySkip(parameters.videoProgress);
        }
        this.setCallButtonEnabled(true);
    }
    setCallButtonEnabled(enabled) {
        if (this._overlay) {
            this._overlay.setCallButtonEnabled(enabled);
        }
    }
    getOperativeEventParams(parameters) {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this._adUnit.getVideo()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcmxheUV2ZW50SGFuZGxlcldpdGhEb3dubG9hZFN1cHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0V2ZW50SGFuZGxlcnMvT3ZlcmxheUV2ZW50SGFuZGxlcldpdGhEb3dubG9hZFN1cHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFjNUUsTUFBTSxPQUFPLHNDQUEyRCxTQUFRLG1CQUFzQjtJQU1sRyxZQUFZLE1BQXNCLEVBQUUsVUFBcUMsRUFBRSxZQUEyQixFQUFFLFdBQXlCO1FBQzdILEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUM7UUFDakUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO0lBRXRDLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxVQUEyQztRQUNoRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUU7WUFDekIsd0VBQXdFO1lBQ3hFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUM5RDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLElBQUksVUFBVSxDQUFDLFdBQVcsRUFBRTtZQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU8sb0JBQW9CLENBQUMsT0FBZ0I7UUFDekMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMvQztJQUNMLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxVQUEyQztRQUN2RSxPQUFPO1lBQ0gsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzFCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM1QyxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1NBQ2pDLENBQUM7SUFDTixDQUFDO0NBQ0oifQ==