import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { PlacementState } from 'Ads/Models/Placement';
import { SDKMetrics, LoadMetric } from 'Ads/Utilities/SDKMetrics';
export class PerPlacementLoadManager extends RefreshManager {
    constructor(ads, adsConfig, coreConfig, campaignManager, clientInfo, focusManager, loadAndFillEventManager) {
        super();
        this._ads = ads;
        this._adsConfig = adsConfig;
        this._coreConfig = coreConfig;
        this._campaignManager = campaignManager;
        this._clientInfo = clientInfo;
        this._focusManager = focusManager;
        this._loadAndFillEventManager = loadAndFillEventManager;
        this._focusManager.onAppForeground.subscribe(() => this.refresh());
        this._focusManager.onActivityResumed.subscribe((activity) => this.refresh());
        this._ads.LoadApi.onLoad.subscribe((placements) => {
            Object.keys(placements).forEach((placementId) => {
                const count = placements[placementId];
                this.loadPlacement(placementId, count);
            });
        });
    }
    getCampaign(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            return placement.getCurrentCampaign();
        }
        return undefined;
    }
    setCurrentAdUnit(adUnit, placement) {
        placement.setCurrentCampaign(undefined);
        this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
    }
    refresh(nofillRetry) {
        this.invalidateExpiredCampaigns();
        return Promise.resolve(undefined);
    }
    initialize() {
        return Promise.resolve();
    }
    shouldRefill(timestamp) {
        return false;
    }
    setPlacementState(placementId, placementState) {
        const placement = this._adsConfig.getPlacement(placementId);
        placement.setState(placementState);
        this.sendPlacementStateChanges(placementId);
    }
    sendPlacementStateChanges(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement.getPlacementStateChanged()) {
            placement.setPlacementStateChanged(false);
            this._ads.Placement.setPlacementState(placementId, placement.getState());
            this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[placement.getPreviousState()], PlacementState[placement.getState()]);
        }
        this.alertPlacementReadyStatus(placement);
    }
    setPlacementStates(placementState, placementIds) {
        // todo: implement method or remove from parent class
    }
    // count is the number of times load was called for a placementId before we could process it
    loadPlacement(placementId, count) {
        const placement = this._adsConfig.getPlacement(placementId);
        this._loadAndFillEventManager.sendLoadTrackingEvents(placementId);
        if (placement && this.shouldLoadCampaignForPlacement(placement)) {
            this.setPlacementState(placementId, PlacementState.WAITING);
            this._campaignManager.loadCampaign(placement).then(loadedCampaign => {
                if (loadedCampaign) {
                    placement.setCurrentCampaign(loadedCampaign.campaign);
                    placement.setCurrentTrackingUrls(loadedCampaign.trackingUrls);
                    this._loadAndFillEventManager.sendFillTrackingEvents(placementId, loadedCampaign.campaign);
                    this.setPlacementState(placementId, PlacementState.READY);
                }
                else {
                    this.setPlacementState(placementId, PlacementState.NO_FILL);
                }
            });
        }
        else {
            const campaign = placement.getCurrentCampaign();
            if (campaign) {
                this._loadAndFillEventManager.sendFillTrackingEvents(placementId, campaign);
            }
            this.alertPlacementReadyStatus(placement);
            SDKMetrics.reportMetricEvent(LoadMetric.LoadAuctionRequestBlocked);
        }
    }
    /**
     *  Returns true if a new campaign should be fetched for the given placement.
     *  A new campaign is only fetched when the campaign is:
     *  - Unfilled (No fill or Not Available)
     *  - Ready and the filled campaign is expired
     */
    shouldLoadCampaignForPlacement(placement) {
        const isUnfilledPlacement = (placement.getState() === PlacementState.NO_FILL || placement.getState() === PlacementState.NOT_AVAILABLE);
        if (isUnfilledPlacement) {
            return true;
        }
        const isReadyPlacement = placement.getState() === PlacementState.READY;
        const campaign = placement.getCurrentCampaign();
        const isExpiredCampaign = !!(campaign && campaign.isExpired());
        if (isReadyPlacement && isExpiredCampaign) {
            return true;
        }
        return false;
    }
    invalidateExpiredCampaigns() {
        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);
            if (placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();
                if (campaign && campaign.isExpired()) {
                    placement.setCurrentCampaign(undefined);
                    this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
                }
            }
        }
    }
    alertPlacementReadyStatus(placement) {
        if (placement && placement.getState() === PlacementState.READY) {
            this._ads.Listener.sendReadyEvent(placement.getId());
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL1BlclBsYWNlbWVudExvYWRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUk3RCxPQUFPLEVBQWEsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFNakUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUlsRSxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsY0FBYztJQVd2RCxZQUFZLEdBQVksRUFBRSxTQUEyQixFQUFFLFVBQTZCLEVBQUUsZUFBZ0MsRUFBRSxVQUFzQixFQUFFLFlBQTBCLEVBQUUsdUJBQWdEO1FBQ3hOLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsdUJBQXVCLENBQUM7UUFFeEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJ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