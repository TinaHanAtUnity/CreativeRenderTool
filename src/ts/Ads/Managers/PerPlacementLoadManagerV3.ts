import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { Observables } from 'Core/Utilities/Observables';
import { PerPlacementLoadManagerWithCometRefreshBase } from 'Ads/Managers/PerPlacementLoadManagerWithCometRefreshBase';

export class PerPlacementLoadManagerV3 extends PerPlacementLoadManagerWithCometRefreshBase {

    private _shouldRefresh: boolean = true;

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        this._shouldRefresh = true;

        Observables.once(adUnit.onStartProcessed, () => {
            // Aids in supplying comet a suitable amount of time to process start event
            setTimeout(() => {
                if (adUnit.isCached()) {
                    this.attemptPeformanceRefresh();
                }
            }, 5000);
        });

        // Refreshes after playback to ensure the least amount of issues while streaming ad content
        Observables.once(adUnit.onClose, () => {
            this.attemptPeformanceRefresh();
        });

        Observables.once(adUnit.onFinish, () => {
            this.attemptPeformanceRefresh();
        });

        super.setCurrentAdUnit(adUnit, placement);
    }

    private attemptPeformanceRefresh(): void {
        if (this._shouldRefresh) {
            this._shouldRefresh = false;
            this.refreshReadyPerformanceCampaigns();
        }
    }
}
