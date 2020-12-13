import { PlacementState } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { LoadV5 } from 'Ads/Utilities/SDKMetrics';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { AdUnitAwareAdRequestManager } from 'Ads/Managers/AdUnitAwareAdRequestManager';
export class PerPlacementLoadManagerV5 extends PerPlacementLoadManager {
    constructor(ads, adsConfig, coreConfig, adRequestManager, clientInfo, focusManager, useGroupIds, loadAndFillEventManager) {
        super(ads, adsConfig, coreConfig, useGroupIds ? new AdUnitAwareAdRequestManager(adRequestManager) : adRequestManager, clientInfo, focusManager, loadAndFillEventManager);
        this._shouldRefresh = true;
        this._adRequestManager = adRequestManager;
        this._adRequestManager.onCampaign.subscribe((placementId, campaign, trackingUrls) => this.onCampaign(placementId, campaign, trackingUrls));
        this._adRequestManager.onNoFill.subscribe((placementId) => this.onNoFill(placementId));
    }
    setCurrentAdUnit(adUnit, placement) {
        this._shouldRefresh = true;
        const campaign = placement.getCurrentCampaign();
        if (campaign) {
            this._lastShownCampaignId = campaign.getUniqueId();
        }
        Observables.once(adUnit.onStartProcessed, () => {
            // Aids in supplying comet a suitable amount of time to process start event
            setTimeout(() => {
                if (adUnit.isCached()) {
                    this.attemptStartRefresh(placement.getId());
                }
            }, 5000);
        });
        // Refreshes after playback to ensure the least amount of issues while streaming ad content
        Observables.once(adUnit.onClose, () => {
            this.attemptStartRefresh(placement.getId());
        });
        Observables.once(adUnit.onFinish, () => {
            this.attemptStartRefresh(placement.getId());
        });
        super.setCurrentAdUnit(adUnit, placement);
    }
    refresh(nofillRetry) {
        return this.invalidateExpiredCampaigns();
    }
    initialize() {
        return this._adRequestManager.requestPreload();
    }
    loadPlacement(placementId, count) {
        if (this._adRequestManager.isPreloadDataExpired()) {
            this.invalidateActivePlacements();
        }
        // If by some reason at the time of load request we don't have preload data
        // we would trigger preload requests and load requests after.
        // It would make sense to use reload request here, however it would require some refactoring,
        // which will be done later.
        if (this._adRequestManager.hasPreloadFailed()) {
            return this._adRequestManager.requestPreload().then(() => {
                super.loadPlacement(placementId, count);
            }).catch((err) => {
                // If preload request failed, therefore we cannot make load request.
                // Therefore we should report no fill, so that we do not cause any timeout.
                this._loadAndFillEventManager.sendLoadTrackingEvents(placementId);
                this.setPlacementState(placementId, PlacementState.WAITING);
                this.setPlacementState(placementId, PlacementState.NO_FILL);
            });
        }
        else {
            return super.loadPlacement(placementId, count);
        }
    }
    invalidateExpiredCampaigns() {
        if (this._adRequestManager.isPreloadDataExpired()) {
            return this.invalidateActivePlacements();
        }
        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);
            if (placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();
                if (campaign && campaign.isExpired()) {
                    this._adRequestManager.reportMetricEvent(LoadV5.RefreshManagerCampaignExpired);
                    placement.setCurrentCampaign(undefined);
                    this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
                }
            }
        }
        return Promise.resolve();
    }
    attemptStartRefresh(placementId) {
        if (this._shouldRefresh) {
            this._shouldRefresh = false;
            this.invalidateActivePlacements(placementId);
        }
    }
    invalidateActivePlacements(excludePlacementId) {
        if (this._campaignManager instanceof AdUnitAwareAdRequestManager) {
            this._campaignManager.invalidate();
        }
        const placementToReload = [];
        for (const placementId of this._adsConfig.getPlacementIds()) {
            if (excludePlacementId && excludePlacementId === placementId) {
                continue;
            }
            const placement = this._adsConfig.getPlacement(placementId);
            if (placement && this.isPlacementActive(placement)) {
                placement.setInvalidationPending(true);
                placementToReload.push(placement.getId());
            }
        }
        return this._adRequestManager.requestReload(placementToReload);
    }
    isPlacementActive(placement) {
        return placement.getState() === PlacementState.READY
            || placement.getState() === PlacementState.WAITING;
    }
    onCampaign(placementId, campaign, trackingUrls) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            placement.setCurrentCampaign(campaign);
            placement.setCurrentTrackingUrls(trackingUrls);
            placement.setInvalidationPending(false);
        }
    }
    onNoFill(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            placement.setInvalidationPending(false);
            let shouldInvalidate = true;
            // Invalidate only Direct Demand campaigns, we would like to show old programmatic campaign.
            const campaign = placement.getCurrentCampaign();
            if (campaign) {
                const contentType = campaign.getContentType();
                switch (contentType) {
                    case PerformanceAdUnitFactory.ContentType:
                    case PerformanceAdUnitFactory.ContentTypeMRAID:
                    case PerformanceAdUnitFactory.ContentTypeVideo:
                        shouldInvalidate = true;
                        break;
                    default:
                        shouldInvalidate = false;
                }
                if (!shouldInvalidate && this._lastShownCampaignId && campaign.getUniqueId() === this._lastShownCampaignId) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZE1hbmFnZXJWNS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvUGVyUGxhY2VtZW50TG9hZE1hbmFnZXJWNS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLEVBQWEsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFHakUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxNQUFNLEVBQWMsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUN4RixPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUd2RixNQUFNLE9BQU8seUJBQTBCLFNBQVEsdUJBQXVCO0lBTWxFLFlBQVksR0FBWSxFQUFFLFNBQTJCLEVBQUUsVUFBNkIsRUFBRSxnQkFBa0MsRUFBRSxVQUFzQixFQUFFLFlBQTBCLEVBQUUsV0FBb0IsRUFBRSx1QkFBZ0Q7UUFDaFAsS0FBSyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSwyQkFBMkIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFKckssbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFNbkMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBRTFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMs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