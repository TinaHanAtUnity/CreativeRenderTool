import { PerPlacementLoadManagerV5 } from 'Ads/Managers/PerPlacementLoadManagerV5';

export class PerPlacementLoadManagerV5NoInvalidation extends PerPlacementLoadManagerV5 {
    protected onNoFill(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);

        if (placement) {
            placement.setInvalidationPending(false);
        }
    }
}
