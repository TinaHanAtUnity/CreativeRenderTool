import { VideoOverlay } from 'Ads/Views/VideoOverlay';
export class VastVideoOverlay extends VideoOverlay {
    constructor(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo, attachTap) {
        super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo, attachTap);
        this._seatId = parameters.campaign.getSeatId();
        this._hasEndcard = parameters.campaign.hasStaticEndscreen();
    }
    cleanUpPrivacy() {
        // Only delete if control of privacy doesn't need to be transferred to endscreen
        if (!this._hasEndcard && this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }
    onPrivacyEvent(event) {
        super.onPrivacyEvent(event);
        const popup = document.querySelector('.view-container');
        const rect = popup.getBoundingClientRect();
        const x = rect.left;
        const y = rect.top;
        const width = rect.width;
        const height = rect.height;
        this._handlers.forEach(handler => handler.onShowPrivacyPopUp(x, y, width, height));
    }
    onPrivacyClose() {
        super.onPrivacyClose();
        this._handlers.forEach(handler => handler.onClosePrivacyPopUp());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZpZGVvT3ZlcmxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvVmFzdFZpZGVvT3ZlcmxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUEyQixNQUFNLHdCQUF3QixDQUFDO0FBRy9FLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxZQUFZO0lBSzlDLFlBQVksVUFBaUQsRUFBRSxPQUF3QixFQUFFLGNBQXVCLEVBQUUsc0JBQStCLEVBQUUsU0FBK0I7UUFDOUssS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTlFLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNoRSxDQUFDO0lBRVMsY0FBYztRQUNwQixnRkFBZ0Y7UUFDaEYsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNyRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRVMsY0FBYyxDQUFDLEtBQVk7UUFDakMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU1QixNQUFNLEtBQUssR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU0sY0FBYztRQUNqQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDSiJ9