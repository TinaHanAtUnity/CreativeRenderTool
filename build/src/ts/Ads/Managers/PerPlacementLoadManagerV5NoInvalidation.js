import { PerPlacementLoadManagerV5 } from 'Ads/Managers/PerPlacementLoadManagerV5';
import { LoadV5 } from 'Ads/Utilities/SDKMetrics';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { PlacementState } from 'Ads/Models/Placement';
export class PerPlacementLoadManagerV5NoInvalidation extends PerPlacementLoadManagerV5 {
    onNoFill(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            placement.setInvalidationPending(false);
            let shouldInvalidate = false;
            let isPerformanceAd = false;
            // Invalidate only Programmatic campaigns if it was already shown before.
            const campaign = placement.getCurrentCampaign();
            if (campaign) {
                const contentType = campaign.getContentType();
                switch (contentType) {
                    case PerformanceAdUnitFactory.ContentType:
                    case PerformanceAdUnitFactory.ContentTypeMRAID:
                    case PerformanceAdUnitFactory.ContentTypeVideo:
                        isPerformanceAd = true;
                        break;
                    default:
                        isPerformanceAd = false;
                }
                if (!isPerformanceAd && this._lastShownCampaignId && campaign.getUniqueId() === this._lastShownCampaignId) {
                    this._adRequestManager.reportMetricEvent(LoadV5.RefreshManagerForcedToInvalidate);
                    shouldInvalidate = true;
                }
            }
            if (shouldInvalidate) {
                this._adRequestManager.reportMetricEvent(LoadV5.RefreshManagerCampaignFailedToInvalidate);
                placement.setCurrentCampaign(undefined);
                placement.setCurrentTrackingUrls(undefined);
                this.setPlacementState(placementId, PlacementState.NO_FILL);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZE1hbmFnZXJWNU5vSW52YWxpZGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9QZXJQbGFjZW1lbnRMb2FkTWFuYWdlclY1Tm9JbnZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbkYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2xELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sdUNBQXdDLFNBQVEseUJBQXlCO0lBQ3hFLFFBQVEsQ0FBQyxXQUFtQjtRQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU1RCxJQUFJLFNBQVMsRUFBRTtZQUNYLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QyxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztZQUM3QixJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFFNUIseUVBQXlFO1lBQ3pFLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ2hELElBQUksUUFBUSxFQUFFO2dCQUNWLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDOUMsUUFBUSxXQUFXLEVBQUU7b0JBQ2pCLEtBQUssd0JBQXdCLENBQUMsV0FBVyxDQUFDO29CQUMxQyxLQUFLLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDO29CQUMvQyxLQUFLLHdCQUF3QixDQUFDLGdCQUFnQjt3QkFDMUMsZUFBZSxHQUFHLElBQUksQ0FBQzt3QkFDdkIsTUFBTTtvQkFDVjt3QkFDSSxlQUFlLEdBQUcsS0FBSyxDQUFDO2lCQUMvQjtnQkFFRCxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLG9CQUFvQixFQUFFO29CQUN2RyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7b0JBQ2xGLGdCQUFnQixHQUFHLElBQUksQ0FBQztpQkFDM0I7YUFDSjtZQUVELElBQUksZ0JBQWdCLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsd0NBQXdDLENBQUMsQ0FBQztnQkFDMUYsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4QyxTQUFTLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQy9EO1NBQ0o7SUFDTCxDQUFDO0NBQ0oifQ==