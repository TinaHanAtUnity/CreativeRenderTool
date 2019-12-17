import { IAdsApi } from 'Ads/IAds';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';

export class AdmobAdapterManager  {
    private _ads: IAdsApi;

    constructor(ads: IAdsApi) {
        this._ads = ads;
        this._ads.Listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, newState) => {
            if (newState === 'NO_FILL') {
                this.sendNoFill(placementId);
            }
        });
    }

    private sendNoFill(placementId: string) {
        this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INTERNAL_ERROR], placementId);
    }
}
