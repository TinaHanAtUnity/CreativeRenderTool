import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerPlacementLoadManagerWithCometRefreshBase } from 'Ads/Managers/PerPlacementLoadManagerWithCometRefreshBase';

export class PerPlacementLoadManagerWithCometRefreshAfterAnyStart extends PerPlacementLoadManagerWithCometRefreshBase {

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        Observables.once(adUnit.onStartProcessed, () => {
            return this.refreshCampaigns();
        });
        super.setCurrentAdUnit(adUnit, placement);
    }
}
