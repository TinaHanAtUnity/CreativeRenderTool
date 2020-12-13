import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { LoadV5 } from 'Ads/Utilities/SDKMetrics';
export class AdUnitAwareAdRequestManager extends CampaignManager {
    constructor(adRequestManager) {
        super();
        this._adUnitPlacements = {};
        this._adRequestManager = adRequestManager;
        this._adRequestManager.onAdditionalPlacementsReady.subscribe((groupId, additionalPlacements) => this.onAdditionalPlacementsReady(groupId, additionalPlacements));
    }
    request(nofillRetry) {
        return this._adRequestManager.request(nofillRetry);
    }
    loadCampaign(placement) {
        if (!placement.hasGroupId()) {
            return this._adRequestManager.loadCampaign(placement);
        }
        const groupId = placement.getGroupId();
        if (groupId === undefined) {
            return this._adRequestManager.loadCampaign(placement);
        }
        if (!(groupId in this._adUnitPlacements)) {
            return this._adRequestManager.loadCampaignWithAdditionalPlacement(placement);
        }
        const additionalPlacements = this._adUnitPlacements[groupId];
        if (!(placement.getId() in additionalPlacements)) {
            return this._adRequestManager.loadCampaignWithAdditionalPlacement(placement);
        }
        this._adRequestManager.reportMetricEvent(LoadV5.LoadRequestStarted, { 'src': 'groupId' });
        this._adRequestManager.reportMetricEvent(LoadV5.LoadRequestParsingResponse, { 'src': 'groupId' });
        const notCachedLoadedCampaign = additionalPlacements[placement.getId()];
        if (notCachedLoadedCampaign === undefined) {
            return Promise.resolve(undefined);
        }
        this._adRequestManager.reportMetricEvent(LoadV5.LoadRequestFill, { 'src': 'groupId' });
        return this._adRequestManager.cacheCampaign(notCachedLoadedCampaign);
    }
    invalidate() {
        this._adUnitPlacements = {};
    }
    onAdditionalPlacementsReady(groupId, additionalPlacements) {
        if (groupId === undefined) {
            return;
        }
        this._adUnitPlacements[groupId] = additionalPlacements;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0QXdhcmVBZFJlcXVlc3RNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9BZFVuaXRBd2FyZUFkUmVxdWVzdE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBbUIsTUFBTSw4QkFBOEIsQ0FBQztBQUtoRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFbEQsTUFBTSxPQUFPLDJCQUE0QixTQUFRLGVBQWU7SUFJNUQsWUFBWSxnQkFBa0M7UUFDMUMsS0FBSyxFQUFFLENBQUM7UUFISixzQkFBaUIsR0FBMkUsRUFBRSxDQUFDO1FBS25HLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztJQUNySyxDQUFDO0lBRU0sT0FBTyxDQUFDLFdBQWlDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sWUFBWSxDQUFDLFNBQW9CO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsbUNBQW1DLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDakY7UUFFRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksb0JBQW9CLENBQUMsRUFBRTtZQUM3QyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQ0FBbUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNqRjtRQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFbEcsTUFBTSx1QkFBdUIsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN4RSxJQUFJLHVCQUF1QixLQUFLLFNBQVMsRUFBRTtZQUN2QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDckM7UUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRXZGLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTSxVQUFVO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRU8sMkJBQTJCLENBQUMsT0FBMkIsRUFBRSxvQkFBMkU7UUFDeEksSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQ3ZCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxvQkFBb0IsQ0FBQztJQUMzRCxDQUFDO0NBQ0oifQ==