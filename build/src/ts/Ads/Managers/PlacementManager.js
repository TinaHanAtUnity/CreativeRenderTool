import { PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
export class PlacementManager {
    constructor(ads, configuration) {
        this._ads = ads;
        this._configuration = configuration;
        this._placementCampaignMap = {};
    }
    addCampaignPlacementIds(placementId, campaign) {
        this._placementCampaignMap[placementId] = campaign;
    }
    getPlacementCampaignMap(adType) {
        const placementIds = Object.keys(this._placementCampaignMap);
        const res = {};
        placementIds.forEach((placementId) => {
            if (this._placementCampaignMap[placementId].getAdType() === adType) {
                res[placementId] = this._placementCampaignMap[placementId];
            }
        });
        return res;
    }
    clear() {
        this._placementCampaignMap = {};
    }
    setPlacementState(placementId, newState) {
        const placement = this._configuration.getPlacement(placementId);
        const oldState = placement.getState();
        if (placement) {
            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
    }
    setAllPlacementStates(newState) {
        for (const placementId of this._configuration.getPlacementIds()) {
            this.setPlacementState(placementId, newState);
        }
    }
    setPlacementReady(placementId, campaign) {
        const placement = this._configuration.getPlacement(placementId);
        if (placement) {
            this.setPlacementState(placementId, PlacementState.READY);
            placement.setCurrentCampaign(campaign);
        }
    }
    setCampaign(placementId, campaign) {
        const placement = this._configuration.getPlacement(placementId);
        if (placement) {
            placement.setCurrentCampaign(campaign);
        }
    }
    getCampaign(placementId) {
        const placement = this._configuration.getPlacement(placementId);
        if (placement) {
            return placement.getCurrentCampaign();
        }
        return undefined;
    }
    clearCampaigns() {
        for (const placementId of this._configuration.getPlacementIds()) {
            this._configuration.getPlacement(placementId).setCurrentCampaign(undefined);
        }
    }
    sendPlacementStateChange(placementId, oldState, newState) {
        if (oldState !== newState) {
            this._ads.Placement.setPlacementState(placementId, newState);
            this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[newState]);
            if (newState === PlacementState.READY) {
                this._ads.Listener.sendReadyEvent(placementId);
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvUGxhY2VtZW50TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQWEsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBTWxELE1BQU0sT0FBTyxnQkFBZ0I7SUFLekIsWUFBWSxHQUFZLEVBQUUsYUFBK0I7UUFDckQsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRU0sdUJBQXVCLENBQUMsV0FBbUIsRUFBRSxRQUFrQjtRQUNsRSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQ3ZELENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxNQUFjO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDN0QsTUFBTSxHQUFHLEdBQThCLEVBQUUsQ0FBQztRQUUxQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDakMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssTUFBTSxFQUFFO2dCQUNoRSxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzlEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTSxLQUFLO1FBQ1IsSUFBSSxDQUFDLHFCQUFx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