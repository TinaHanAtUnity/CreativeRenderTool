import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';

export class PerPlacementLoadManagerV4 extends PerPlacementLoadManager {

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        if (placement.getCurrentCampaign() instanceof PerformanceCampaign) {
            // Only invalidate once the ad is guaranteed to be started
            Observables.once(adUnit.onStartProcessed, () => {
                return this.invalidatePlacements();
            });
        }
        super.setCurrentAdUnit(adUnit, placement);
    }

    private invalidatePlacements() {
        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);
            placement.setCurrentCampaign(undefined);
            this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
        }
    }
}
