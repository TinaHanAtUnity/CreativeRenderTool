import { MraidMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { MRAID } from 'MRAID/Views/MRAID';
export class CustomCloseMRAID extends MRAID {
    constructor(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId = 0, hidePrivacy = false) {
        super(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivacy);
        this._mraidCustomCloseCalled = false;
        this._mraidCustomCloseDelay = placement.allowSkip() ? 5 : 40;
    }
    show() {
        super.show();
        // NOTE: When allowSkip is true, move the close button to the left.
        // This is a temporary test and will likely be removed in the future.
        if (this._placement.allowSkip()) {
            this.moveCloseGraphicLeft();
        }
    }
    onCloseEvent(event) {
        super.onCloseEvent(event);
        SDKMetrics.reportMetricEvent(MraidMetric.ClosedByUnityAds);
    }
    onBridgeClose() {
        super.onBridgeClose();
        this.clearCustomCloseTimeout();
        SDKMetrics.reportMetricEvent(MraidMetric.ClosedByAdUnit);
    }
    onUseCustomClose(shouldHideClose) {
        super.onUseCustomClose(shouldHideClose);
        SDKMetrics.reportMetricEvent(MraidMetric.UseCustomCloseCalled);
        if (!shouldHideClose) {
            this.clearCustomCloseTimeout();
            this.setCloseVisibility(true);
            return;
        }
        if (this._mraidCustomCloseCalled) {
            return;
        }
        this._mraidCustomCloseCalled = true;
        this.setupCustomClose();
    }
    setCloseVisibility(visible) {
        const closeElement = this._container.querySelector('.close');
        if (closeElement) {
            closeElement.style.display = visible ? 'block' : 'none';
        }
    }
    setupCustomClose() {
        SDKMetrics.reportMetricEvent(MraidMetric.CloseHidden);
        this.setCloseVisibility(false);
        const hideDuration = this._mraidCustomCloseDelay * 1000;
        this._mraidCustomCloseTimeout = window.setTimeout(() => {
            this.setCloseVisibility(true);
        }, hideDuration);
    }
    clearCustomCloseTimeout() {
        window.clearTimeout(this._mraidCustomCloseTimeout);
    }
    moveCloseGraphicLeft() {
        SDKMetrics.reportMetricEvent(MraidMetric.CloseMovedToLeft);
        const closeRegionElement = this._container.querySelector('.close-region');
        if (closeRegionElement) {
            closeRegionElement.style.removeProperty('right');
            closeRegionElement.style.left = '0';
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tQ2xvc2VNUkFJRC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NUkFJRC9WaWV3cy9DdXN0b21DbG9zZU1SQUlELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFPbkUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxLQUFLO0lBS3ZDLFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsVUFBc0IsRUFBRSxTQUFvQixFQUFFLFFBQXVCLEVBQUUsT0FBd0IsRUFBRSxjQUF1QixFQUFFLE9BQWdCLEVBQUUsZ0JBQXdCLENBQUMsRUFBRSxjQUF1QixLQUFLO1FBQy9PLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUVySCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO1FBRXJDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2pFLENBQUM7SUFFTSxJQUFJO1FBQ1AsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsbUVBQW1FO1FBQ25FLHFFQUFxRTtRQUNyRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBRU0sWUFBWSxDQUFDLEtBQVk7UUFDNUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixVQUFVLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVNLGFBQWE7UUFDaEIsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQy9CLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVNLGdCQUFnQixDQUFDLGVBQXdCO1FBQzVDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN4QyxVQUFVLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsT0FBTztTQUNWO1FBRUQsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDOUIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztRQUVwQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRU8sa0JBQWtCLENBQUMsT0FBZ0I7UUFDdkMsTUFBTSxZQUFZLEdBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLElBQUksWUFBWSxFQUFFO1lBQ2QsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUMzRDtJQUNMLENBQUM7SUFFTyxnQkFBZ0I7UUFDcEIsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztRQUN4RCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDbkQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRU8sdUJBQXVCO1FBQzNCLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLG9CQUFvQjtRQUN4QixVQUFVLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0QsTUFBTSxrQkFBa0IsR0FBaUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDeEYsSUFBSSxrQkFBa0IsRUFBRTtZQUNwQixrQkFBa0IsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztDQUNKIn0=