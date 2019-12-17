import { IAdsApi } from 'Ads/IAds';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { Platform } from 'Core/Constants/Platform';
import { PlacementState } from 'Ads/Models/Placement';

export class AdmobAdapterManager  {
    private _ads: IAdsApi;

    constructor(ads: IAdsApi, platform: Platform) {
        this._ads = ads;
        this._ads.Listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, newState) => {
            if (newState === 'NO_FILL') {
                this.sendNoFill(placementId, platform);
            }
        });
    }

    private sendNoFill(placementId: string, platform: Platform) {
        if (platform === Platform.IOS) {
            this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], placementId);   
        } else {
            this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INTERNAL_ERROR], placementId);
        }
    }
}
