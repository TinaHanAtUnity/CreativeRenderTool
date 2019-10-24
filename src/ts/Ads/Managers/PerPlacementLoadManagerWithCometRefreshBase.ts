import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { PlacementState } from 'Ads/Models/Placement';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { LoadMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export class PerPlacementLoadManagerWithCometRefreshBase extends PerPlacementLoadManager {

    public refreshCampaigns(): Promise<void[]> {
        const loadCampaignPromises = [];
        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);

            if (placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();

                if (campaign && campaign instanceof PerformanceCampaign) {

                    this._pts.reportMetricEvent(LoadMetric.LoadCometRefreshRequest);
                    loadCampaignPromises.push(this._campaignManager.loadCampaign(placement).then(loadedCampaign => {
                        if (loadedCampaign) {
                            // Don't update state since this is just swapping a ready campaign for a ready campaign
                            placement.setCurrentCampaign(loadedCampaign.campaign);
                            placement.setCurrentTrackingUrls(loadedCampaign.trackingUrls);
                            this._pts.reportMetricEvent(LoadMetric.LoadCometRefreshFill);
                        } else {
                            placement.setCurrentCampaign(undefined);
                            this.setPlacementState(placementId, PlacementState.NO_FILL);
                            this._pts.reportMetricEvent(LoadMetric.LoadCometRefreshNoFill);
                        }
                    }));
                }
            }
        }
        return Promise.all(loadCampaignPromises);
    }
}
