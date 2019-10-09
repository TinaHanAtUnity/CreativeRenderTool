import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { LoadMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export class PerPlacementLoadManagerWithCometRefresh extends PerPlacementLoadManager {

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        if (placement.getCurrentCampaign() instanceof PerformanceCampaign) {
            Observables.once(adUnit.onStartProcessed, () => {
                return this.refreshReadyPerformanceCampaigns();
            });
        }
        super.setCurrentAdUnit(adUnit, placement);
    }

    public refreshReadyPerformanceCampaigns(): Promise<void[]> {
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