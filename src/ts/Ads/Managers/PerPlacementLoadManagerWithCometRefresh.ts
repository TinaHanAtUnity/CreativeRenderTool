import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerPlacementLoadManagerWithCometRefreshBase } from 'Ads/Managers/PerPlacementLoadManagerWithCometRefreshBase';

export class PerPlacementLoadManagerWithCometRefresh extends PerPlacementLoadManagerWithCometRefreshBase {

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        if (placement.getCurrentCampaign() instanceof PerformanceCampaign) {
            Observables.once(adUnit.onStartProcessed, () => {
                return this.refreshCampaigns();
            });
        }
        super.setCurrentAdUnit(adUnit, placement);
    }
}
