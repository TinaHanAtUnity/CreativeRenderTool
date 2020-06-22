import { PerPlacementLoadManagerV5 } from 'Ads/Managers/PerPlacementLoadManagerV5';
import { LoadV5 } from 'Ads/Utilities/SDKMetrics';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { PlacementState } from 'Ads/Models/Placement';

export class PerPlacementLoadManagerV5NoInvalidation extends PerPlacementLoadManagerV5 {
    protected onNoFill(placementId: string): void {
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
