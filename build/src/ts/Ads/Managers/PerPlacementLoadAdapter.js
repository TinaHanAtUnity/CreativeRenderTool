import { PlacementState } from 'Ads/Models/Placement';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
export class PerPlacementLoadAdapter extends CampaignRefreshManager {
    constructor(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache, loadAndFillEventManager) {
        super(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache);
        this._trackablePlacements = {};
        this._activePlacements = {};
        this._forceLoadPlacements = {};
        this._ads = ads;
        this._adsConfig = adsConfig;
        this._initialized = false;
        this._loadAndFillEventManager = loadAndFillEventManager;
        this._ads.LoadApi.onLoad.subscribe((placements) => {
            Object.keys(placements).forEach((placementId) => {
                if (this._initialized) {
                    this._loadAndFillEventManager.sendLoadTrackingEvents(placementId);
                    this.sendLoadAPIEvent(placementId);
                }
                else {
                    this._forceLoadPlacements[placementId] = placementId;
                }
            });
        });
    }
    initialize() {
        this._initialized = true;
        Object.keys(this._forceLoadPlacements).forEach((placementId) => {
            this._loadAndFillEventManager.sendLoadTrackingEvents(placementId);
            this._trackablePlacements[placementId] = placementId;
        });
        return super.initialize();
    }
    setCurrentAdUnit(adUnit, placement) {
        super.setCurrentAdUnit(adUnit, placement);
        this.sendPlacementStateChangesLoadAdapter(placement.getId(), PlacementState.READY, PlacementState.NOT_AVAILABLE);
    }
    sendPlacementStateChanges(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement === undefined) {
            delete this._trackablePlacements[placementId];
            delete this._activePlacements[placementId];
            this.sendPlacementStateChange(placementId, PlacementState.NO_FILL);
            return;
        }
        if (this._trackablePlacements[placementId]) {
            if (placement.getPlacementStateChanged()) {
                this.sendPlacementStateChangesLoadAdapter(placementId, placement.getPreviousState(), placement.getState());
                if (placement.getState() !== PlacementState.WAITING) {
                    delete this._trackablePlacements[placementId];
                }
            }
        }
        else if (this._activePlacements[placementId]) {
            if (placement.getPlacementStateChanged() && placement.getState() === PlacementState.NOT_AVAILABLE) {
                delete this._activePlacements[placementId];
            }
            else if (placement.getPlacementStateChanged() && placement.getPreviousState() === PlacementState.WAITING && placement.getState() === PlacementState.NO_FILL) {
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                delete this._activePlacements[placementId];
            }
        }
        placement.setPlacementStateChanged(false);
    }
    sendPlacementStateChangesLoadAdapter(placementId, previousState, nextState) {
        this._ads.Placement.setPlacementState(placementId, nextState);
        this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[previousState], PlacementState[nextState]);
        if (nextState === PlacementState.READY) {
            this._activePlacements[placementId] = placementId;
            this._ads.Listener.sendReadyEvent(placementId);
            const placement = this._adsConfig.getPlacement(placementId);
            if (placement) {
                const campaign = placement.getCurrentCampaign();
                if (campaign) {
                    this._loadAndFillEventManager.sendFillTrackingEvents(placementId, campaign);
                }
            }
        }
    }
    sendLoadAPIEvent(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement === undefined) {
            this.sendPlacementStateChange(placementId, PlacementState.NO_FILL);
            return;
        }
        if (placement.getState() === PlacementState.WAITING) {
            this._trackablePlacements[placementId] = placementId;
        }
        this.sendPlacementStateChange(placementId, placement.getState());
    }
    sendPlacementStateChange(placementId, placementState) {
        switch (placementState) {
            case PlacementState.WAITING:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                break;
            case PlacementState.READY:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.READY);
                break;
            case PlacementState.NO_FILL:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                break;
            case PlacementState.NOT_AVAILABLE:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                break;
            case PlacementState.DISABLED:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                break;
            default:
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZEFkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL1BlclBsYWNlbWVudExvYWRBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBYSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUdqRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQVk3RSxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsc0JBQXNCO0lBUS9ELFlBQVksUUFBa0IsRUFDbEIsSUFBYyxFQUNkLFVBQTZCLEVBQzdCLEdBQVksRUFDWixhQUE0QixFQUM1QixlQUFnQyxFQUNoQyxTQUEyQixFQUMzQixZQUEwQixFQUMxQixjQUE4QixFQUM5QixVQUFzQixFQUN0QixPQUF1QixFQUN2QixLQUFtQixFQUNuQix1QkFBZ0Q7UUFDeEQsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFuQnhJLHlCQUFvQixHQUE2QixFQUFFLENBQUM7UUFDcEQsc0JBQWlCLEdBQTZCLEVBQUUsQ0FBQztRQUNqRCx5QkFBb0IsR0FBNkIsRUFBRSxDQUFDO1FBbUJ4RCxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsd0JBQXdCLEdBQUcsdUJBQXVCLENBQUM7UUFFeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFVBQW1DLEVBQUUsRUFBRTtZ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