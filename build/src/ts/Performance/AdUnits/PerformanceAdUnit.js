import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
export class PerformanceAdUnit extends VideoAdUnit {
    constructor(parameters) {
        super(parameters);
        parameters.overlay.setSpinnerEnabled(!CampaignAssetInfo.isCached(parameters.campaign));
        this._endScreen = parameters.endScreen;
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());
        this._privacy = parameters.privacy;
        this._performanceCampaign = parameters.campaign;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }
    hide() {
        if (this._endScreen) {
            this._endScreen.hide();
            const endScreenContainer = this._endScreen.container();
            if (endScreenContainer && endScreenContainer.parentElement) {
                endScreenContainer.parentElement.removeChild(endScreenContainer);
            }
        }
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
        }
        return super.hide();
    }
    description() {
        return 'performance';
    }
    getEndScreen() {
        return this._endScreen;
    }
    setDownloadStatusMessage(message) {
        const downloadMessageText = document.body.getElementsByClassName('download-message-text')[0];
        if (downloadMessageText) {
            downloadMessageText.innerHTML = message;
        }
    }
    disableDownloadButton() {
        const downloadContainer = document.body.getElementsByClassName('download-container')[0];
        if (downloadContainer) {
            downloadContainer.classList.add('disabled');
        }
    }
    enableDownloadButton() {
        const downloadContainer = document.body.getElementsByClassName('download-container')[0];
        if (downloadContainer) {
            downloadContainer.classList.remove('disabled');
        }
    }
    onVideoError() {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this.sendTrackingEvent(TrackingEvent.ERROR);
    }
    sendTrackingEvent(event) {
        this._thirdPartyEventManager.sendTrackingEvents(this._performanceCampaign, event, 'performance');
    }
    getCampaign() {
        return this._performanceCampaign;
    }
    unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
        delete this._privacy;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvUGVyZm9ybWFuY2UvQWRVbml0cy9QZXJmb3JtYW5jZUFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBCLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlFLE9BQU8sRUFBMEIsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFNUYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFXcEUsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFdBQWdDO0lBT25FLFlBQVksVUFBd0M7UUFDaEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxCLFVBQVUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFdkYsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ2hELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUM7SUFDckUsQ0FBQztJQUVNLElBQUk7UUFDUCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkQsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hELGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUNwRTtTQUNKO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkQsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUNoRTtTQUNKO1FBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVNLFdBQVc7UUFDZCxPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0sd0JBQXdCLENBQUMsT0FBZTtRQUMzQyxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RixJQUFJLG1CQUFtQixFQUFFO1lBQ3JCLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7U0FDM0M7SUFDTCxDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLElBQUksaUJBQWlCLEVBQUU7WUFDbkIsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUMvQztJQUNMLENBQUM7SUFFTSxvQkFBb0I7UUFDdkIsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsSUFBSSxpQkFBaUIsRUFBRTtZQUNuQixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2xEO0lBQ0wsQ0FBQztJQUVNLFlBQVk7UUFDZixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxTQUFTLEVBQUU7WUFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDcEI7UUFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxLQUFvQjtRQUN6QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNyRyxDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDO0lBQ3JDLENBQUM7SUFFUyxlQUFlO1FBQ3JCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDdkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7Q0FDSiJ9