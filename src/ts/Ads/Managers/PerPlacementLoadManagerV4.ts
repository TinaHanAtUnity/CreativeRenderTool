import { PerPlacementLoadManagerV3 } from 'Ads/Managers/PerPlacementLoadManagerV3';
import { PlacementState } from 'Ads/Models/Placement';
import { LoadMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';

export class PerPlacementLoadManagerV4 extends PerPlacementLoadManagerV3 {

    public refreshCampaigns(): Promise<void[]> {
        const programmaticLoadCampaignPromises: Promise<void>[] = [];
        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);

            if (placement && placement.getState() === PlacementState.READY) {

                const campaign = placement.getCurrentCampaign();

                if (campaign && campaign instanceof ProgrammaticCampaign) {
                    this._pts.reportMetricEvent(LoadMetric.LoadProgrammaticRefreshRequest);
                    programmaticLoadCampaignPromises.push(this._campaignManager.loadCampaign(placement).then(loadedCampaign => {
                        if (loadedCampaign) {
                            // Don't update state since this is just swapping a ready campaign for a ready campaign
                            placement.setCurrentCampaign(loadedCampaign.campaign);
                            placement.setCurrentTrackingUrls(loadedCampaign.trackingUrls);
                            this._pts.reportMetricEvent(LoadMetric.LoadProgrammaticFill);
                        } else {
                            // Use previous fill on programmatic no fill
                            this._pts.reportMetricEvent(LoadMetric.LoadProgrammaticUsedPreviousFill);
                        }
                    }));
                }
            }
        }
        // Refresh Comet filled placements, and then Programmatic filled placements
        return super.refreshCampaigns().then(() => {
            return Promise.all(programmaticLoadCampaignPromises);
        });
    }
}
