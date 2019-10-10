import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerPlacementLoadManagerWithCometRefresBase } from 'Ads/Managers/PerPlacementLoadManagerWithCometRefreshBase';

export class PerPlacementLoadManagerWithCometRefresh extends PerPlacementLoadManagerWithCometRefresBase {

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        if (placement.getCurrentCampaign() instanceof PerformanceCampaign) {
            Observables.once(adUnit.onStartProcessed, () => {
                return this.refreshReadyPerformanceCampaigns();
            });
        }
        super.setCurrentAdUnit(adUnit, placement);
    }
}
